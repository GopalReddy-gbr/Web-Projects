const inputs = document.querySelectorAll(".otp-input");
const submitBtn = document.getElementById("submit-btn");

inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value.length === 1) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

submitBtn.addEventListener("click", () => {
    const otp = Array.from(inputs).map(input => input.value).join('');
    alert("Entered OTP: " + otp);
});
