// Using Frankfurter API - Free and no API key required
const BASE_URL = 'https://api.frankfurter.app';

// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const resultDiv = document.getElementById('result');

// Initialize currency dropdowns
async function initializeCurrencyDropdowns() {
    try {
        const response = await fetch(`${BASE_URL}/currencies`);
        if (!response.ok) {
            throw new Error('Failed to fetch currencies');
        }
        const currencies = await response.json();
        
        // Convert currencies object to array for sorting
        const currencyArray = Object.entries(currencies).map(([code, name]) => ({
            code,
            name
        })).sort((a, b) => a.code.localeCompare(b.code));

        // Add search functionality to dropdowns
        fromCurrencySelect.innerHTML = `<input type="text" class="currency-search" placeholder="Search currency...">`;
        toCurrencySelect.innerHTML = `<input type="text" class="currency-search" placeholder="Search currency...">`;

        // Create option groups for both dropdowns
        const fromOptGroup = document.createElement('optgroup');
        fromOptGroup.label = 'Currencies';
        const toOptGroup = document.createElement('optgroup');
        toOptGroup.label = 'Currencies';

        currencyArray.forEach(({ code, name }) => {
            const option1 = new Option(`${code} - ${name}`, code);
            const option2 = new Option(`${code} - ${name}`, code);
            fromOptGroup.appendChild(option1);
            toOptGroup.appendChild(option2);
        });

        fromCurrencySelect.appendChild(fromOptGroup);
        toCurrencySelect.appendChild(toOptGroup);

        // Set default values
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'EUR';

        // Add search functionality
        const searchInputs = document.querySelectorAll('.currency-search');
        searchInputs.forEach(input => {
            input.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const select = this.parentElement;
                const options = select.getElementsByTagName('option');

                for (let option of options) {
                    const text = option.text.toLowerCase();
                    option.style.display = text.includes(searchTerm) ? '' : 'none';
                }
            });
        });
    } catch (error) {
        console.error('Error fetching currencies:', error);
        resultDiv.innerHTML = '<p style="color: red;">Error loading currencies. Please refresh the page.</p>';
    }
}

// Fetch exchange rate and convert
async function convertCurrency() {
    try {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount)) {
            throw new Error('Please enter a valid amount');
        }

        // Show loading state
        resultDiv.innerHTML = '<p>Converting...</p>';

        // Fetch the exchange rate
        const response = await fetch(`${BASE_URL}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rate');
        }
        
        const data = await response.json();
        const result = data.rates[toCurrency];
        
        if (result) {
            resultDiv.innerHTML = `
                <p>${amount.toFixed(2)} ${fromCurrency} = </p>
                <h2>${result.toFixed(2)} ${toCurrency}</h2>
                <p>Exchange rate: 1 ${fromCurrency} = ${(result/amount).toFixed(4)} ${toCurrency}</p>
            `;
        } else {
            throw new Error('Unable to fetch exchange rate');
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

// Event Listeners
convertBtn.addEventListener('click', convertCurrency);
amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        convertCurrency();
    }
});

// Add swap button functionality
const swapBtn = document.getElementById('swapBtn');
swapBtn.addEventListener('click', () => {
    const tempValue = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = tempValue;
    if (amountInput.value) {
        convertCurrency();
    }
});

// Initialize the app
initializeCurrencyDropdowns();
