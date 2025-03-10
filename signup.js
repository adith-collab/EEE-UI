var alertRedInput = "#8C1010";
var defaultInput = "rgba(10, 180, 180, 1)";

document.addEventListener('DOMContentLoaded', (event) => {
    var form = document.querySelector('.signupForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        var username = document.getElementById("username");
        var password = document.getElementById("password");
        var email = document.getElementById("email");

        // Perform validation here
        if (userNameValidation(username.value) && passwordValidation(password.value)) {
            // Redirect to homepage if validation is successful
            window.location.href = 'homepage.html';
        }
    });
});

function userNameValidation(usernameInput) {
    var username = document.getElementById("username");
    var issueArr = [];
    if (/[-!@#$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(usernameInput)) {
        issueArr.push("No special characters!");
    }
    if (issueArr.length > 0) {
        username.setCustomValidity(issueArr.join("\n"));
        username.style.borderColor = alertRedInput;
        return false;
    } else {
        username.setCustomValidity("");
        username.style.borderColor = defaultInput;
        return true;
    }
}

function passwordValidation(passwordInput) {
    var password = document.getElementById("password");
    var issueArr = [];
    if (!/^.{7,15}$/.test(passwordInput)) {
        issueArr.push("Password must be between 7-15 characters.");
    }
    if (!/\d/.test(passwordInput)) {
        issueArr.push("Must contain at least one number.");
    }
    if (!/[a-z]/.test(passwordInput)) {
        issueArr.push("Must contain a lowercase letter.");
    }
    if (!/[A-Z]/.test(passwordInput)) {
        issueArr.push("Must contain an uppercase letter.");
    }
    if (issueArr.length > 0) {
        password.setCustomValidity(issueArr.join("\n"));
        password.style.borderColor = alertRedInput;
        return false;
    } else {
        password.setCustomValidity("");
        password.style.borderColor = defaultInput;
        return true;
    }
}
