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
function renderCategories() {
    const tbody = document.getElementById('categoryBody');
    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.limit.toLocaleString()} VND</td>
            <td>
                <button onclick="openEdit(${category.id})">Sửa</button>
                <button onclick="deleteCategory(${category.id})">Xóa</button>
            </td>
        </tr>
    `).join('');
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
//chỗ này cần sửa  saveData(); 
    categories.push({ id: Date.now(), name, limit });
    updateCategoryUI();
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryLimit').value = '';
});

// Các hàm edit/delete category giữ nguyên

/* ========== PHẦN 5: XỬ LÝ GIAO DỊCH ========== */
function addExpense() {
    const categoryId = parseInt(document.getElementById("selectedCategory").value);
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const note = document.getElementById("expenseNote").value.trim();
    const errorElement = document.getElementById("expenseError");
    const warningElement = document.getElementById("categoryWarning");

    errorElement.style.display = "none";
    warningElement.style.display = "none";

    if (!selectedMonth || !categoryId || !amount || amount <= 0) {
        errorElement.textContent = "Vui lòng điền đầy đủ thông tin";
        errorElement.style.display = "block";
        return;
    }

    const monthData = monthlyData.find(m => m.month === selectedMonth);
    const category = categories.find(c => c.id === categoryId);

    if (amount > monthData.remaining) {
        errorElement.textContent = "Vượt quá ngân sách còn lại!";
        errorElement.style.display = "block";
        return;
    }

    const categorySpent = monthData.expenses
        .filter(e => e.categoryId === categoryId)
        .reduce((sum, e) => sum + e.amount, 0);

    if (categorySpent + amount > category.limit) {
        warningElement.textContent = `Cảnh báo: Vượt quá giới hạn ${category.name}!`;
        warningElement.style.display = "block";
        return;
    }

    monthData.expenses.push({
        id: Date.now(),
        categoryId,
        amount,
        note,
        date: new Date().toLocaleDateString()
    });

    monthData.remaining -= amount;
    saveData();
    updateUI();
}

/* ========== PHẦN 6: HIỂN THỊ DỮ LIỆU ========== */
function updateUI() {
    const monthData = monthlyData.find(item => item.month === selectedMonth);
    if (!monthData) return;

    // Cập nhật số dư
    document.querySelector('.reOkane p').textContent = 
        `${monthData.remaining.toLocaleString()} VND`;

    // Cập nhật danh sách
    updateCategoryUI();
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
