let quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Creativity is intelligence having fun.", category: "Inspiration" },
    { text: "Do what you can with all you have, wherever you are.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available in this category.";
        return;
    }
    const randomQoute = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.textContent = `"${randomQoute.text}" - (${randomQoute.category})`;
}

function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const quoteText = textInput.value.trim();
    const quotecategory = categoryInput.value.trim();

    if (!quoteText || !quotecategory) {
        alert("Please enter both quote text and category.");
        return;
    }

    const newQuote = { text: quoteText, category: quotecategory };
    quotes.push(newQuote);

    updateCategoryOptions();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
}

function updateCategoryOptions() {
    const categories = new Set(quotes.mao(q => q.category));
    categoryFilter.innerHTML = `<option value="all">All</option>`;
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.value = cat;
        categoryFilter.appendChild(option);
    });
}

function createAddQuoteForm() {
    const container = document.getElementById('quoteFormContainer');

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.id = 'newQuoteText';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Quote';
    addBtn.addEventListener('click', addQuote);

    container.appendChild(quoteInput);
    container.appendChild(categoryInput);
    container.appendChild(addBtn);
}

newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', showRandomQuote);
updateCategoryOptions();
createAddQuoteForm();