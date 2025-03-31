// Lấy elements từ DOM
const formRegister = document.getElementById("formRegister");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const userName = document.getElementById("userName");
const signup = document.getElementById("Signup");

// Elements thông báo lỗi
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmError = document.getElementById("confirmError");
const userNameError = document.getElementById("userNameError");

// Lấy dữ liệu từ local storage
let userLocal = JSON.parse(localStorage.getItem("users")) || [];

function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

formRegister.addEventListener("submit", function(e) {
    e.preventDefault();
    let isValid = true;

    // Reset errors
    [userNameError, emailError, passwordError, confirmError].forEach(error => error.style.display = "none");

    // Validate username
    if (!userName.value.trim()) {
        userNameError.textContent = "Vui lòng nhập tên";
        userNameError.style.display = "block";
        isValid = false;
    }

    // Validate email
    if (!email.value) {
        emailError.textContent = "Vui lòng nhập email";
        emailError.style.display = "block";
        isValid = false;
    } else if (!validateEmail(email.value)) {
        emailError.textContent = "Email không đúng định dạng";
        emailError.style.display = "block";
        isValid = false;
    }

    // Validate password
    if (!password.value) {
        passwordError.textContent = "Vui lòng nhập mật khẩu";
        passwordError.style.display = "block";
        isValid = false;
    } else if (password.value.length < 6) {
        passwordError.textContent = "Mật khẩu phải có ít nhất 6 ký tự";
        passwordError.style.display = "block";
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword.value) {
        confirmError.textContent = "Vui lòng xác nhận mật khẩu";
        confirmError.style.display = "block";
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        confirmError.textContent = "Mật khẩu không khớp";
        confirmError.style.display = "block";
        isValid = false;
    }

    if (isValid) {
        const user = {
            userId: Date.now().toString(), // Sử dụng timestamp làm ID
            userName: userName.value.trim(),
            email: email.value,
            password: password.value, // Lưu ý: Trong thực tế cần hash password
        };

        // Kiểm tra email đã tồn tại chưa
        const isExist = userLocal.some(u => u.email === user.email);
        if (isExist) {
            emailError.textContent = "Email đã được đăng ký";
            emailError.style.display = "block";
            return;
        }

        userLocal.push(user);
        localStorage.setItem("users", JSON.stringify(userLocal));
        window.location.href = "login.html";
    }
    
});

// Xử lý sự kiện input
[userName, email, password, confirmPassword].forEach(input => {
    input.addEventListener("input", () => {
        document.getElementById(`${input.id}Error`).style.display = "none";
    });
});
