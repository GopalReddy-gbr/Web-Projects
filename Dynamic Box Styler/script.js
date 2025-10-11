

const box = document.querySelector(".box");
const input = document.getElementById("styleInput");

input.addEventListener("input", () => {
    box.style.borderRadius = input.value;
    box.style.background = input.value;
});
