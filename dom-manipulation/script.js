const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
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

    sessionStorage.setItem("LastQuote", JSON.stringify(randomQoute));
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
    saveQuotes();
    populateCategories();
    pushQuoteToServer();

    document.getElementById('newQuoteText').value = "";
    document.getElementById('newQuoteCategory').value = "";
    alert("Qoute added!")
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

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (!Array.isArray(importedQuotes)) throw new Error("invalid format");
            quotes.push(...importedQuotes);
            saveQuotes();
            updateCategoryOptions();
            alert('Quotes imported successfully!');
        } catch (err) {
            alert('Failed to import quotes. Please check your JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

function populateCategories() {
    const categories = new Set(quotes.map(q => q.category));
    const select = document.getElementById('categoryFilter');
    select.innerHTML = `<option value="all">All Categories</option>`;

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });

    const lastSelected = localStorage.getItem("lastSelectedCategory");
    if (lastSelected) {
        select.value = lastSelected;
    }
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem("lastSelectedCategory", selectedCategory);

    const filteredQuotes = selectedCategory === "all"
      ? quotes
      :
      quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = "No quotes available in this category.";
        return;
    }

    const randomQoute = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.textContent = `"${randomQoute.text}" - (${randomQoute.category})`;

    sessionStorage.setItem("lastQuote", JSON.stringify(randomQoute));
}

async function syncWithServer() {
    try {
        const res = await fetch(SERVER_URL);
        if (!res.ok) throw new Error("Failed to fetch from server");

        const serverQuotes = await res.json();
        const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

        const mergedQuotes = resolveConflicts(localQuotes, serverQuotes);
        quotes = mergedQuotes;
        saveQuotes();
        populateCategories();
        filterQuotes();

        notifyUser("Quotes synced with server!");
    } catch (err) {
        console.error("sync error", err);
        notifyUser("Sync failed. Server may be offline.", true);
    }
}

async function fetchQuotesFromServer() {
    const response = await fetch(SERVER_URL);
    if (!response.ok) {
        throw new Error("Failed to fetch quotes from server.");
    }
    return await response.json();
}

function resolveConflicts(local, server) {
    const seen = new Set();
    const combined = [];

    server.forEach(q => {
        const key = q.text + "|" + q.category;
        seen.add(key);
        combined.push(q);
    });

    local.forEach(q => {
        const key = q.text + "|" + q.category;
        seen.add(key);
        combined.push(q);
    });

    return;
}

async function pushQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    if (!response.ok) {
      throw new Error("Failed to push quote to server");
    }

    console.log("Quote pushed to server:", quote);
  } catch (error) {
    console.error("Push failed:", error);
    notifyUser("Failed to push quote to server", true);
  }
}

async function syncQuotes() {
    await syncWithServer();
}

newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', showRandomQuote);
createAddQuoteForm();
updateCategoryOptions();

setInterval(syncWithServer, 30000);