// Grab display input and history list
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".keypad-container button");
const historyList = document.getElementById("history-list");

// View containers
const calculatorView = document.getElementById("calculator-view");
const historyView = document.getElementById("history-view");

// View toggle buttons
const showHistoryBtn = document.getElementById("show-history");
const backToCalcBtn = document.getElementById("back-to-calc");

// NEW: Get reference to the main calculator container to hide its direct children
const calculatorMainContainer = document.querySelector(".calculator");

// Function to update visibility (using classes)
function showCalculatorMode() {
    // Hide history-related elements
    historyView.classList.add('hidden');

    // Show calculator-related elements
    display.classList.remove('hidden'); // Show display
    showHistoryBtn.classList.remove('hidden'); // Show history toggle button
    calculatorView.classList.remove('hidden'); // Show calculator keypad
    
    // Optional: Clear display when returning to calculator
    display.value = ''; 
}

function showHistoryMode() {
    // Hide calculator-related elements
    display.classList.add('hidden'); // Hide display
    showHistoryBtn.classList.add('hidden'); // Hide history toggle button
    calculatorView.classList.add('hidden'); // Hide calculator keypad

    // Show history-related elements
    historyView.classList.remove('hidden');
    // Populate history list here, if you want it refreshed every time
    populateHistoryList(); // Call the function to refresh history
}


// ========== BUTTON CLICK LOGIC ========== //
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const buttonText = button.innerText;

        if (buttonText === "C") {
            // Clear the display
            display.value = "";
        } else if (buttonText === "⌫") {
            // Remove last character
            backspace();
        } else if (buttonText === "=") {
            // Calculate expression using math.js
            try {
                const sanitized = sanitizeInput(display.value);
                const result = math.evaluate(sanitized);
                display.value = result;
                addToHistory(sanitized, result);
            } catch (e) {
                display.value = "Error";
            }
        } else {
            // Append number/operator to display
            display.value += buttonText;
        }
    });
});

// ========== KEYBOARD INPUT SUPPORT ========== //
document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (!isNaN(key) || ['+', '-', '*', '/', '.', '%', '^'].includes(key)) {
        // Allow numbers and operators
        appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        // Trigger calculation
        calculate();
    } else if (key === 'Backspace') {
        // Trigger backspace
        backspace();
    } else if (key.toLowerCase() === 'c') {
        // Trigger clear
        clearDisplay();
    }
});

// ========== DISPLAY MODIFIERS ========== //
function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = "";
}

function backspace() {
    display.value = display.value.slice(0, -1);
}

// ========== MAIN CALCULATION FUNCTION ========== //
function calculate() {
    try {
        const sanitized = sanitizeInput(display.value);
        const result = math.evaluate(sanitized);
        addToHistory(sanitized, result);
        display.value = result;
    } catch (e) {
        display.value = "Error";
    }
}

// ========== SANITIZE INPUT BEFORE EVALUATING ========== //
function sanitizeInput(input) {
    return input
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/X/g, '*')
        .replace(/\^/g, '**');
}

// Global array to store history
let calculationHistory = []; 

// ========== ADD TO HISTORY LOG ========== //
function addToHistory(expression, result) {
    // Add to the in-memory array
    const timestamp = new Date().toLocaleString(); // Add a timestamp for better history
    calculationHistory.unshift({ expression, result, timestamp }); // Add to the beginning

    // Limit history to a reasonable number (e.g., 20 entries)
    if (calculationHistory.length > 20) {
        calculationHistory.pop(); // Remove the oldest entry
    }
    // Note: We no longer update the DOM here directly, but in populateHistoryList
}

// ========== POPULATE HISTORY LIST (NEW FUNCTION) ========== //
function populateHistoryList() {
    historyList.innerHTML = ''; // Clear existing list items

    if (calculationHistory.length === 0) {
        const noEntry = document.createElement("li");
        noEntry.textContent = "No history yet.";
        historyList.appendChild(noEntry);
        return;
    }

    calculationHistory.forEach(item => {
        const entry = document.createElement("li");
        entry.textContent = `${item.expression} = ${item.result} (${item.timestamp})`;
        // Optional: Make history items clickable to load into display
        entry.addEventListener('click', () => {
            display.value = item.result;
            showCalculatorMode(); // Go back to calculator view
        });
        historyList.appendChild(entry);
    });
}


// ========== VIEW SWITCHING ========== //
showHistoryBtn.addEventListener("click", showHistoryMode);
backToCalcBtn.addEventListener("click", showCalculatorMode);


// ========== INITIAL SETUP ========== //
// Ensure the calculator view is shown and history is hidden on page load
document.addEventListener('DOMContentLoaded', showCalculatorMode);