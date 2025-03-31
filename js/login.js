// Lấy elements từ DOM
const formLogin = document.getElementById("formLogin");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError"); // Thêm element này trong HTML
const passwordError = document.getElementById("passwordError"); // Thêm element này trong HTML

// Xử lý sự kiện submit form
formLogin.addEventListener("submit", function(e) {
    e.preventDefault();
    
    // Lấy giá trị mới nhất từ input
    const emailUser = emailInput.value.trim();
    const passwordUser = passwordInput.value.trim();
    let isValid = true;

    // Reset thông báo lỗi
    emailError.textContent = "";
    passwordError.textContent = "";
    emailError.style.display = "none";
    passwordError.style.display = "none";

    // Validate email
    if (!emailUser) {
        emailError.textContent = "Vui lòng nhập email";
        emailError.style.display = "block";
        isValid = false;
    }

    // Validate password
    if (!passwordUser) {
        passwordError.textContent = "Vui lòng nhập mật khẩu";
        passwordError.style.display = "block";
        isValid = false;
    }

    if (!isValid) return;

    // Lấy dữ liệu từ localStorage
    const userLocal = JSON.parse(localStorage.getItem("users")) || [];
    
    // Tìm user phù hợp
    const foundUser = userLocal.find(user => 
        user.email === emailUser && 
        user.password === passwordUser
    );

    if (foundUser) {
        // Lưu thông tin user đang đăng nhập
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        // Chuyển hướng đến trang chủ
        window.location.href = "index.html";
    } else {
        passwordError.textContent = "Email hoặc mật khẩu không chính xác";
        passwordError.style.display = "block";
    }
});

// Xử lý sự kiện input để ẩn thông báo lỗi
emailInput.addEventListener("input", () => {
    emailError.style.display = "none";
});

passwordInput.addEventListener("input", () => {
    passwordError.style.display = "none";
});

function Signup(){
    window.location.href = "register";
}