let currentInput = '';
let operator = '';
let previousInput = '';
let resultDisplayed = false;

const screen = document.getElementById('screen');

function updateScreen(value) {
  screen.textContent = value;
}

document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function() {
    const value = this.getAttribute('data-value');
    if (!isNaN(value) || value === '.') {
      // Handle number input
      if (resultDisplayed) {
        currentInput = value;
        resultDisplayed = false;
      } else {
        currentInput += value;
      }
      updateScreen(currentInput);
    } else if (['+', '-', '*', '/'].includes(value)) {
      // Handle operators
      operator = value;
      previousInput = currentInput;
      currentInput = '';
    } else if (value === '=') {
      // Calculate result
      let result;
      switch(operator) {
        case '+':
          result = parseFloat(previousInput) + parseFloat(currentInput);
          break;
        case '-':
          result = parseFloat(previousInput) - parseFloat(currentInput);
          break;
        case '*':
          result = parseFloat(previousInput) * parseFloat(currentInput);
          break;
        case '/':
          result = parseFloat(previousInput) / parseFloat(currentInput);
          break;
      }
      updateScreen(result);
      currentInput = result + '';
      resultDisplayed = true;
    } else if (value === 'clear') {
      currentInput = '';
      previousInput = '';
      operator = '';
      updateScreen('0');
    }
  });
});
