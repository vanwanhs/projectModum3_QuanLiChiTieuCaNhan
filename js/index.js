/* ========== PHẦN 1: XỬ LÝ USER & AUTHENTICATION ========== */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const accountSelect = document.getElementById("account");
const currentUserSpan = document.getElementById("currentUser");

// Kiểm tra trạng thái đăng nhập
if (currentUser) {
    currentUserSpan.textContent = currentUser.userName;
} else {
    window.location.href = 'login.html';
}

// Xử lý sự kiện đăng xuất
accountSelect.addEventListener('change', function() {
    if (this.value === 'logout') {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
});

/* ========== PHẦN 2: KHỞI TẠO VÀ QUẢN LÝ DỮ LIỆU ========== */
let monthlyData = JSON.parse(localStorage.getItem('monthlyData')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let selectedMonth = '';
let currentEditId = null;
let currentPage = 1;
const itemsPerPage = 5;
let searchQuery = '';
let sortOrder = 'asc';

// Khởi tạo giao diện khi trang tải
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderCategoryOptions();
    updateUI();
});

/* ========== PHẦN 3: XỬ LÝ NGÂN SÁCH ========== */
const budgetInput = document.getElementById("budgetInput");
const btnSaveBudget = document.getElementById("btnSaveBudget");
const budgetError = document.getElementById("budgetError");

// Xử lý chọn tháng
document.querySelector('.date-input').addEventListener('change', function(e) {
    selectedMonth = e.target.value;
    const existingData = monthlyData.find(item => item.month === selectedMonth);
    
    if (!existingData) {
        monthlyData.push({
            month: selectedMonth,
            budget: 0,
            expenses: [],
            remaining: 0
        });
    }
    updateUI();
    saveData();
});

// Xử lý lưu ngân sách
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
        monthData.remaining = budgetValue;
        saveData();
        updateUI();
    }
});

/* ========== PHẦN 4: QUẢN LÝ DANH MỤC ========== */
// function renderCategories() {
//     const tbody = document.getElementById('categoryBody');
//     tbody.innerHTML = categories.map(category => `
//         <tr>
//             <td>${category.name}</td>
//             <td>${category.limit.toLocaleString()} VND</td>
//             <td>
//                 <button onclick="openEdit(${category.id})">Sửa</button>
//                 <button onclick="deleteCategory(${category.id})">Xóa</button>
                
//             </td>
//         <hr>
//         </tr>
        
//     `).join('');
// }
function renderCategories() {
    const tbody = document.getElementById("categoryBody");
    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.limit.toLocaleString()} VND</td>
            <td>
                <button onclick="openEdit(${category.id})" style="border:none; color:red; background-color:#FFFFFF">Sửa</button>
                <button onclick="deleteCategory(${category.id})"style="border:none; color:red;background-color:#FFFFFF;">Xóa</button>
            </td>
        </tr>
        <tr><td colspan="3"><hr></td></tr> 
    `).join('');
}



function renderCategoryOptions() {
    const select = document.getElementById('selectedCategory');
    select.innerHTML = '<option value="">Chọn danh mục</option>' + 
        categories.map(c => 
            `<option value="${c.id}">${c.name}</option>`
        ).join('');
}

function updateCategoryUI() {
    renderCategories();
    renderCategoryOptions();
    saveData();
}

document.getElementById('btnAddCategory').addEventListener('click', () => {
    const name = document.getElementById('categoryName').value.trim();
    const limit = parseFloat(document.getElementById('categoryLimit').value);
    const errorElement = document.getElementById('categoryError');

    if (!name || !limit) {
        errorElement.textContent = "Vui lòng nhập đầy đủ thông tin";
        errorElement.style.display = 'block';
        return;
    }

    // Kiểm tra trùng tên danh mục
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        errorElement.textContent = "Tên danh mục đã tồn tại";
        errorElement.style.display = 'block';
        return;
    }

    categories.push({ id: Date.now(), name, limit });
    saveData();
    updateCategoryUI();
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryLimit').value = '';
});

// Hàm mở form chỉnh sửa
function openEdit(id) {
    const category = categories.find(c => c.id === id);
    document.getElementById('editCategoryId').value = id;
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryLimit').value = category.limit;
    document.getElementById('editForm').style.display = 'block';
}

// Hàm xóa danh mục
function deleteCategory(id) {
    categories = categories.filter(c => c.id !== id);
    saveData();
    updateCategoryUI();
}

// Xử lý sự kiện lưu chỉnh sửa
document.getElementById('btnSaveEdit').addEventListener('click', () => {
    const id = parseInt(document.getElementById('editCategoryId').value);
    const name = document.getElementById('editCategoryName').value.trim();
    const limit = parseFloat(document.getElementById('editCategoryLimit').value);
    const errorElement = document.getElementById('editCategoryError');
    
    errorElement.textContent = '';
    
    if (!name || !limit) {
        errorElement.textContent = "Vui lòng nhập đầy đủ thông tin";
        return;
    }

    // Kiểm tra trùng tên (trừ chính nó)
    const existingCategory = categories.find(c => 
        c.name.toLowerCase() === name.toLowerCase() && c.id !== id
    );
    if (existingCategory) {
        errorElement.textContent = "Tên danh mục đã tồn tại";
        return;
    }
    
    const index = categories.findIndex(c => c.id === id);
    categories[index] = { ...categories[index], name, limit };
    saveData();
    updateCategoryUI();
    cancelEdit();
});

// Hàm hủy chỉnh sửa
function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('editCategoryError').textContent = '';
}

/* ========== PHẦN 5: XỬ LÝ GIAO DỊCH ========== */
function addExpense() {
    const categoryId = parseInt(document.getElementById("selectedCategory").value);
    const amountInput = document.getElementById("expenseAmount").value.replace(/,/g, '');
    const amount = parseFloat(amountInput);
    const note = document.getElementById("expenseNote").value.trim();
    const errorElement = document.getElementById("expenseError");
    const warningElement = document.getElementById("categoryWarning");

    // Reset thông báo
    errorElement.style.display = "none";
    warningElement.style.display = "none";

    // Validation cơ bản
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

    // Kiểm tra ngân sách
    if (!monthData || monthData.budget <= 0) {
        errorElement.textContent = "Vui lòng thiết lập ngân sách trước!";
        errorElement.style.display = "block";
        return;
    }

    // Kiểm tra số dư
    if (amount > monthData.remaining) {
        errorElement.textContent = `Vượt quá ngân sách còn lại (${monthData.remaining.toLocaleString()} VND)!`;
        errorElement.style.display = "block";
        return;
    }

    // Tính toán chi tiêu theo category
    const categorySpent = monthData.expenses
        .filter(e => e.categoryId === categoryId)
        .reduce((sum, e) => sum + e.amount, 0);

    // Kiểm tra hạn mức category
    // if (categorySpent + amount > category.limit) {
    //     warningElement.innerHTML = `⚠️ Cảnh báo: Vượt quá hạn mức <strong>${category.name}/${monthlyData.budget}</strong> (${category.limit.toLocaleString()} VND)!`;
    //     warningElement.style.display = "block";
    //     // return;
    // }

    if (categorySpent + amount > category.limit) {
        const monthData = monthlyData.find(m => m.month === selectedMonth);
        
        warningElement.innerHTML = `⚠️ Cảnh báo: 
            Vượt quá hạn mức <strong>${category.name}</strong> (${category.limit.toLocaleString()} VND) |
            Ngân sách tháng: ${monthData.budget.toLocaleString()} VND
        `;
        
        warningElement.style.display = "block";
        
        // return; // Bỏ comment dòng này nếu muốn BLOCK thêm giao dịch
    }
    // Thêm giao dịch
    monthData.expenses.push({
        id: Date.now(),
        categoryId,
        amount,
        note,
        date: new Date().toLocaleDateString('vi-VN') // Format ngày Việt Nam
    });

    // Cập nhật số tiền còn lại
    monthData.remaining -= amount;

    // Reset các bộ lọc và tìm kiếm
    searchQuery = '';
    currentPage = 1;
    document.querySelector('.search').value = ''; // Xóa nội dung tìm kiếm
    sortOrder = 'asc'; // Reset sắp xếp

    // Cập nhật giao diện
    saveData();
    updateUI();

    // Reset form nhập
    document.getElementById("expenseAmount").value = '';
    document.getElementById("expenseNote").value = '';
    // Cập nhật số dư
    monthData.remaining -= amount;
    
    // Lưu và cập nhật UI
    saveData();
    updateUI();
    
    // Reset form nhập
    document.getElementById("expenseAmount").value = '';
    document.getElementById("expenseNote").value = '';
}

/* ========== PHẦN 6: HIỂN THỊ DỮ LIỆU ========== */
function updateUI() {
    const monthData = monthlyData.find(item => item.month === selectedMonth);
    if (monthData) {
        // Tính toán lại remaining để đảm bảo chính xác
        const totalSpent = monthData.expenses.reduce((sum, e) => sum + e.amount, 0);
        monthData.remaining = monthData.budget - totalSpent;
        
        // Cập nhật hiển thị
        document.querySelector('.reOkane p').textContent = 
            `${monthData.remaining.toLocaleString()} VND`;
    }
    
    updateTransactionUI();
    // Cập nhật thống kê
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

function updateTransactionUI() {
    const monthData = monthlyData.find(m => m.month === selectedMonth);
    if (!monthData) return;

    let filteredData = monthData.expenses
        .filter(e => e.note.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    document.querySelector('.transaction-item table').innerHTML = `
        <tr>
            <th>Ngày</th>
            <th>Danh mục</th>
            <th>Số tiền</th>
            <th>Ghi chú</th>
        </tr>
        ${paginatedData.map(expense => {
            const category = categories.find(c => c.id === expense.categoryId);
            return `
            <tr>
                <td>${expense.date}</td>
                <td>${category?.name || 'Khác'}</td>
                <td>${expense.amount.toLocaleString()} VND</td>
                <td>${expense.note}</td>
            </tr>`;
        }).join('')}
    `;

    document.getElementById('pageNumbers').textContent = `${currentPage}/${totalPages}`;
}

/* ========== PHẦN 7: TIỆN ÍCH ========== */
function saveData() {
    localStorage.setItem('monthlyData', JSON.stringify(monthlyData));
    localStorage.setItem('categories', JSON.stringify(categories));
}

document.querySelector('.search').addEventListener('input', function(e) {
    searchQuery = e.target.value;
    currentPage = 1;
    updateTransactionUI();
});

document.querySelector('.button2').addEventListener('click', function() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    updateTransactionUI();
});

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
/// hàm thêm của traslate form
// Tự động format số tiền khi nhập
document.getElementById('expenseAmount').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '')
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
});

// Cho phép nhấn Enter để thêm
document.getElementById('expenseNote').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addExpense();
    }
});
function renderCategoryOptions() {
    const select = document.getElementById('selectedCategory');
    select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.name} (${category.limit.toLocaleString()} VND)`;
        select.appendChild(option);
    });
}