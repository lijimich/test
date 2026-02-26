class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.animateDisplay();
    }

    delete() {
        if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
        this.animateDisplay();
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = number.toString();
            this.shouldResetScreen = false;
        } else {
            if (number === '.' && this.currentOperand.includes('.')) return;
            if (this.currentOperand === '0' && number !== '.') {
                this.currentOperand = number.toString();
            } else {
                this.currentOperand = this.currentOperand.toString() + number.toString();
            }
        }
        this.animateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && this.previousOperand === '') return;
        if (this.currentOperand === 'Error') return;

        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation;
            this.updateDisplay();
            return;
        }
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.shouldResetScreen = false;
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    computation = 'Error';
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }

        if (computation !== 'Error') {
            // rounding to avoid JS floating point issues
            computation = Math.round(computation * 100000000) / 100000000;
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.animateDisplay();
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay === '' ? '' : integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand) || (this.currentOperand === '0' ? '0' : '');
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }

        // Adjust font size dynamically based on length
        const currentLen = this.currentOperandTextElement.innerText.length;
        if (currentLen > 12) {
            this.currentOperandTextElement.style.fontSize = '1.8rem';
        } else if (currentLen > 8) {
            this.currentOperandTextElement.style.fontSize = '2.2rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '3rem';
        }
    }

    animateDisplay() {
        // Simple subtle pulse on number change
        this.currentOperandTextElement.style.transform = 'scale(1.05)';
        setTimeout(() => {
            if (this.currentOperandTextElement) {
                this.currentOperandTextElement.style.transform = 'scale(1)';
            }
        }, 100);
        this.updateDisplay();
    }
}

const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-action="equals"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
    });
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
});

clearButton.addEventListener('click', button => {
    calculator.clear();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
});

// Keyboard support
document.addEventListener('keydown', function (event) {
    if (event.key >= 0 && event.key <= 9) {
        calculator.appendNumber(event.key);
        const btn = Array.from(numberButtons).find(b => b.dataset.number === event.key);
        if (btn) triggerButtonAnimation(btn);
    }
    if (event.key === '.') {
        calculator.appendNumber(event.key);
        const btn = Array.from(numberButtons).find(b => b.dataset.number === event.key);
        if (btn) triggerButtonAnimation(btn);
    }
    if (event.key === '=' || event.key === 'Enter') {
        event.preventDefault();
        calculator.compute();
        triggerButtonAnimation(equalsButton);
    }
    if (event.key === 'Backspace') {
        calculator.delete();
        triggerButtonAnimation(deleteButton);
    }
    if (event.key === 'Escape' || event.key === 'Delete') {
        calculator.clear();
        triggerButtonAnimation(clearButton);
    }
    if (event.key === '+' || event.key === '-') {
        calculator.chooseOperation(event.key);
        const btn = Array.from(operatorButtons).find(b => b.dataset.operator === event.key);
        if (btn) triggerButtonAnimation(btn);
    }
    if (event.key === '*') {
        calculator.chooseOperation('×');
        const btn = Array.from(operatorButtons).find(b => b.dataset.operator === '×');
        if (btn) triggerButtonAnimation(btn);
    }
    if (event.key === '/') {
        event.preventDefault(); // prevent quick find
        calculator.chooseOperation('÷');
        const btn = Array.from(operatorButtons).find(b => b.dataset.operator === '÷');
        if (btn) triggerButtonAnimation(btn);
    }
});

function triggerButtonAnimation(button) {
    if (!button) return;
    button.classList.add('keyboard-active');
    setTimeout(() => {
        button.classList.remove('keyboard-active');
    }, 150);
}
