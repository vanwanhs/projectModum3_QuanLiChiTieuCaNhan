
/* ========== PHẦN 1: XỬ LÝ USER & AUTHENTICATION ========== */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const accountSelect = document.getElementById("account");
const currentUserSpan = document.getElementById("currentUser");

if (currentUser) {
    currentUserSpan.textContent = currentUser.userName;
} else {
    window.location.href = 'login.html';
}

document.getElementById("account").addEventListener("change", function (e) {
    if (e.target.value === "logout") {
        logoutAccount();
    }
});

function logoutAccount() {
    Swal.fire({
        title: "Are you sure you want to log out?",
        text: "This action will take you back to the login page.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Log out",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("currentUser");
            Swal.fire({
                icon: "success",
                title: "Logged out successfully",
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = "login.html";
            });
        }
    });
}


/* ==========  KHỞI TẠO VÀ QUẢN LÝ DỮ LIỆU ========== */
let monthlyData = JSON.parse(localStorage.getItem('monthlyData')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let selectedMonth = '';
let currentPage = 1;
const itemsPerPage = 5;
let searchQuery = '';
let sortOrder = 'asc';
let statusSortAsc = true; // biến cờ để đảo chiều mỗi lần sắp xếp (của chức năng làm thêm sắp xếp theo trạng thái)

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderCategoryOptions();
    updateUI();
});

/* ========== XỬ LÝ NGÂN SÁCH ========== */
const budgetInput = document.getElementById("budgetInput");
const btnSaveBudget = document.getElementById("btnSaveBudget");
const budgetError = document.getElementById("budgetError");

document.querySelector('.date-input').addEventListener('change', function(e) {
    selectedMonth = e.target.value;
    let existingData = monthlyData.find(item => item.month === selectedMonth);
    if (!existingData) {
        existingData = {
            id: Date.now(),
            month: selectedMonth,
            budget: 0,
            remaining: 0,
            expenses: [],
            categories: categories,
        };
        monthlyData.push(existingData);
        saveData();
    }
    const budgetInput = document.getElementById("budgetInput");
    const textErrorDate =
    if (existingData.budget > 0) {
        budgetInput.value = existingData.budget.toLocaleString();  // Hiển thị ngân sách nếu có
    } else {
        budgetInput.value = '';  // Nếu không có ngân sách, để trống
    }

    updateUI();
});

btnSaveBudget.addEventListener("click", function() {
    
    const monthError = document.getElementById("monthError");
    budgetError.style.display = "none";
    monthError.style.display = "none";

    if (!selectedMonth) {
        monthError.textContent = "Vui lòng chọn tháng trước!";
        monthError.style.display = "block";
        return;
    }

    const budgetValue = parseFloat(budgetInput.value.replace(/,/g, ''));
    if (!budgetValue || budgetValue <= 0) {
        budgetError.textContent = "Vui lòng nhập số tiền hợp lệ";
        budgetError.style.display = "block";
        return;
    }

    const monthData = monthlyData.find(item => item.month === selectedMonth);
    if (monthData) {
        monthData.budget = budgetValue;
        monthData.remaining = budgetValue - (monthData.expenses || []).reduce((sum, e) => sum + e.amount, 0);
        saveData();
        updateUI();
    }
});


/* ========== DANH MỤC ========== */
function renderCategories() {
    const tbody = document.getElementById("categoryBody");
    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.limit.toLocaleString()} VND</td>
            <td>
                <button onclick="openEdit(${category.id})" style="border:none; color:red; background-color:#FFFFFF">Sửa</button>
                <button onclick="deleteCategory(${category.id})" style="border:none; color:red;background-color:#FFFFFF;">Xóa</button>
            </td>
        </tr>
        <tr><td colspan="3"><hr></td></tr> 
    `).join('');
}

function renderCategoryOptions() {
    const select = document.getElementById('selectedCategory');
    select.innerHTML = '<option value="">-- Chọn danh mục --</option>';

    if (!selectedMonth || selectedMonth.trim() === '') return;

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.name} (${category.limit.toLocaleString()} VND)`;
        select.appendChild(option);
    });
}

document.getElementById('btnAddCategory').addEventListener('click', () => {
    const name = document.getElementById('categoryName').value.trim();
    const limit = parseFloat(document.getElementById('categoryLimit').value);
    const errorElement = document.getElementById('categoryError');

    // [name,limit].forEach(error => error.style.display = "none");
    if (!name || !limit) {
        errorElement.textContent = "Vui lòng nhập đầy đủ thông tin";
        errorElement.style.display = 'block';
        return;
    } 

    if (name && limit){
        errorElement.textContent = "";
        errorElement.style.display = 'none';
    }
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        errorElement.textContent = "Tên danh mục đã tồn tại";
        errorElement.style.display = 'block';
        return;
    }

    categories.push({ id: Date.now(), name, limit });
    saveData();
    renderCategories();
    renderCategoryOptions();
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryLimit').value = '';
});

/// Mở form chỉnh sửa cùa thư mục
function openEdit(id) {
    const category = categories.find(c => c.id === id);
    document.getElementById('editCategoryId').value = id;
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryLimit').value = category.limit;
    document.getElementById('editForm').style.display = 'block';
}

function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    const confirmDelete = confirm(`Bạn có chắc muốn xóa danh mục "${category.name}" không?`);
    if (!confirmDelete) return;
    categories = categories.filter(c => c.id !== id);
    saveData();
    renderCategories();
    renderCategoryOptions();
}

// Sửa dữ liệu thư mục trong bài
document.getElementById('btnSaveEdit').addEventListener('click', () => {
    const id = parseInt(document.getElementById('editCategoryId').value);
    const name = document.getElementById('editCategoryName').value.trim();
    const limit = parseFloat(document.getElementById('editCategoryLimit').value);
    const errorElement = document.getElementById('editCategoryError');

    errorElement.textContent = '';

    if(limit<0){
        errorElement.textContent = "Vui lòng nhập dữ liệu chính xác";
        return;
    }
    if (!name || isNaN(limit) || limit <= 0) {
        errorElement.textContent = "Vui lòng nhập đầy đủ thông tin hợp lệ";
        return;
    }   
    const existingCategory = categories.find(c =>
        c.name.toLowerCase() === name.toLowerCase() && c.id !== id
    );
    if (existingCategory) {
        errorElement.textContent = "Tên danh mục đã tồn tại";
        return;
    }

    const index = categories.findIndex(c => c.id === id);
    const categoryToUpdate = categories[index];
    categoryToUpdate.name = name;
    categoryToUpdate.limit = limit;
    categories[index] = categoryToUpdate;
    saveData();
    renderCategories();
    renderCategoryOptions();
    cancelEdit();
});
// Chức năng đóng danh mục trong bài
function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('editCategoryError').textContent = '';
}

/* ========== GIAO DỊCH ========== */
function addExpense() {
    const categoryId = parseInt(document.getElementById("selectedCategory").value);
    const amountInput = document.getElementById("expenseAmount").value.replace(/,/g, '');
    const amount = parseFloat(amountInput);
    const note = document.getElementById("expenseNote").value.trim();
    const errorElement = document.getElementById("expenseError");
    const warningElement = document.getElementById("categoryWarning");

    errorElement.style.display = "none";
    warningElement.style.display = "none";

    if (!selectedMonth) {
        errorElement.textContent = "Vui lòng chọn tháng trước!";
        errorElement.style.display = "block";
        return;
    }

    if (!categoryId || isNaN(amount) || amount <= 0 || !note) {
        errorElement.textContent = "Vui lòng điền đầy đủ thông tin hợp lệ";
        errorElement.style.display = "block";
        return;
    }

    const monthData = monthlyData.find(m => m.month === selectedMonth);
    const category = categories.find(c => c.id === categoryId);

    if (!monthData || monthData.budget <= 0) {
        errorElement.textContent = "Vui lòng thiết lập ngân sách trước!";
        errorElement.style.display = "block";
        return;
    }

    if (amount > monthData.remaining) {
        errorElement.textContent = `Vượt quá ngân sách còn lại (${monthData.remaining.toLocaleString()} VND)!`;
        errorElement.style.display = "block";
    }

    const categorySpent = monthData.expenses
        .filter(e => e.categoryId === categoryId)
        .reduce((sum, e) => sum + e.amount, 0);

    if (categorySpent + amount > category.limit) {
        warningElement.innerHTML = `⚠️ Cảnh báo: 
            Vượt quá hạn mức <strong>${category.name}</strong> (${category.limit.toLocaleString()} VND) |
            Ngân sách tháng: ${monthData.budget.toLocaleString()} VND`;
        warningElement.style.display = "block";
    }

    monthData.expenses.push({
        id: Date.now(),
        categoryId,
        amount,
        note,
        date: new Date().toLocaleDateString('vi-VN')
    });

    monthData.remaining -= amount;
    currentPage = 1;
    searchQuery = '';
    document.querySelector('.search').value = '';
    sortOrder = 'asc';

    saveData();
    updateUI();
    document.getElementById("expenseAmount").value = '';
    document.getElementById("expenseNote").value = '';
}

/* ========== CẬP NHẬT UI ========== */
function updateUI() {
    const monthData = monthlyData.find(item => item.month === selectedMonth);
    if (monthData) {
        const totalSpent = monthData.expenses.reduce((sum, e) => sum + e.amount, 0);
        monthData.remaining = monthData.budget - totalSpent;
        document.querySelector('.reOkane p').textContent = 
            `${monthData.remaining.toLocaleString()} VND`;
    }

    updateTransactionUI();

    const statsTable = document.querySelector('.monthly-stats tbody');
    statsTable.innerHTML = monthlyData.map(data => `
        <tr>
            <td>${data.month}</td>
            <td>${data.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} VND</td>
            <td>${data.budget.toLocaleString()} VND</td>
            <td>${data.remaining >= 0 ? '✅ Đạt' : '❌ Vượt'}</td>
        </tr>
    `).join('');
}

// sắp xếp theo trạng thái hoạt động
const statusFilter = document.getElementById('statusFilter');

statusFilter.addEventListener('click', function (e) {
    if (statusFilter.value === 'sortStatus') {
        const statsTable = document.querySelector('.monthly-stats tbody');
        const rows = Array.from(statsTable.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const statusA = a.cells[3].textContent.trim();
            const statusB = b.cells[3].textContent.trim();

            if (statusA === statusB) return 0;
            return statusSortAsc ? (statusA === '✅ Đạt' ? -1 : 1) : (statusA === '✅ Đạt' ? 1 : -1);
        });
        statsTable.innerHTML = '';
        rows.forEach(row => statsTable.appendChild(row));

        statusSortAsc = !statusSortAsc;
    }
});


function updateTransactionUI() {
    const currentMonth = monthlyData.find(m => m.month === selectedMonth);
    if (!currentMonth) return;

    let expenses = currentMonth.expenses;

    if (searchQuery) {
        expenses = expenses.filter(e => 
            e.note.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

     expenses.sort((a, b) => sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pagedExpenses = expenses.slice(startIndex, endIndex);

    let tableHTML = `
        <tr>
            <th>Ngày</th>
            <th>Danh mục</th>
            <th>Số tiền</th>
            <th>Ghi chú</th>
            <th></th>
        </tr> 
    `;

    for (const expense of pagedExpenses) {
        const category = categories.find(c => c.id === expense.categoryId);
        const categoryName = category ? category.name : 'Khác';

        tableHTML += `
           <tr>
                <td>${expense.date}</td>
                <td>${categoryName}</td>
                <td>${expense.amount.toLocaleString()} VND</td>
                <td>${expense.note}</td>
                <td>
                    <button onclick="deleteExpense(${expense.id})" 
                            style="border:none; color:red; background:transparent">
                        Xóa
                    </button>
                </td>
            </tr>
        `;
    }

    document.querySelector('.transaction-item table').innerHTML = tableHTML;
    // phần trang
    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';
    // phần trang ở đoạn bên dưới các ô khi bấm vào ô nào nó sẽ nhảy tới ô đó
    for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.style.margin = '0 4px';
    pageButton.style.padding = '6px 10px';
    pageButton.style.borderRadius = '6px';
    pageButton.style.border = '1px solid #ccc';
    pageButton.style.backgroundColor = i === currentPage ? '#3B82F6' : '#fff';
    pageButton.style.color = i === currentPage ? '#fff' : '#000';
    pageButton.onclick = () => {
        currentPage = i;
        updateTransactionUI();
    };
    pageNumbersContainer.appendChild(pageButton);
    }

}

/* ========== TIỆN ÍCH ========== */
function saveData() {
    localStorage.setItem('monthlyData', JSON.stringify(monthlyData));
    localStorage.setItem('categories', JSON.stringify(categories));
}

document.querySelector('.search').addEventListener('input', function(e) {
    searchQuery = e.target.value;
    currentPage = 1;
    updateTransactionUI();
});

// sắp xếp theo danh mục
document.getElementById('sortOrderSelect').addEventListener('change', function(e) {
    sortOrder = e.target.value;
    updateTransactionUI();
});

// sắp xếp theo trang thái
// document.getElementById('sortStatus').addEventListener('click', function(e) {
//     sortStatus();
// });

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateTransactionUI();
    }
}

function nextPage() {
    const totalPages = Math.ceil(
        monthlyData.find(m => m.month === selectedMonth)?.expenses.length / itemsPerPage
    );
    if (currentPage < totalPages) {
        currentPage++;
        updateTransactionUI();
    }
}

document.getElementById('expenseAmount').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '')
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
});

document.getElementById('expenseNote').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addExpense();
    }
});

function deleteExpense(expenseId) {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa giao dịch này?");
    if (!confirmDelete) return;

    const monthData = monthlyData.find(m => m.month === selectedMonth);
    if (!monthData) return;

    const expenseIndex = monthData.expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return;

    monthData.remaining += monthData.expenses[expenseIndex].amount;
    monthData.expenses.splice(expenseIndex, 1);
    currentPage = 1;
    saveData();
    updateUI();
}
