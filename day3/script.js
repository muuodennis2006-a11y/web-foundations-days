let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study" },
    { id: 3, text: "Email the project report to Grace", category: "work" },
    { id: 4, text: "Revise JavaScript arrays", category: "study" },
    { id: 5, text: "Call mum", category: "personal" }
];

function searchNotes(word) {
    return notes.filter(note =>
        note.text.toLowerCase().includes(word.toLowerCase())
    );
}

function longestNote() {
    if (notes.length === 0) {
        return null;
    }

    let longest = notes[0];

    for (let note of notes) {
        if (note.text.length > longest.text.length) {
            longest = note;
        }
    }

    return longest;
}

function countByCategory() {
    let counts = {};

    for (let note of notes) {
        if (counts[note.category]) {
            counts[note.category]++;
        } else {
            counts[note.category] = 1;
        }
    }

    return counts;
}

function getSummary() {
    let counts = countByCategory();

    return `${notes.length} notes: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

function isDuplicate(text) {
    let cleanedText = text.trim().toLowerCase();

    return notes.some(note =>
        note.text.trim().toLowerCase() === cleanedText
    );
}

function addNote(text, category) {
    let cleanedText = text.trim();
    let validCategories = ["personal", "work", "study"];

    if (cleanedText.length < 1 || cleanedText.length > 200) {
        console.log("Note must be between 1 and 200 characters.");
        return false;
    }

    if (isDuplicate(cleanedText)) {
        console.log("Note already exists.");
        return false;
    }

    if (!validCategories.includes(category)) {
        console.log("Invalid category.");
        return false;
    }

    let newNote = {
        id: notes.length + 1,
        text: cleanedText,
        category: category
    };

    notes.push(newNote);

    console.log("Note added successfully.");
    return true;
}


// searchNotes tests
console.log("Search result:", searchNotes("JavaScript"));
// Expected: note 4

console.log("Search with no results:", searchNotes("pizza"));
// Expected: []

// longestNote tests
console.log("Longest note:", longestNote());
// Expected: the note with the most characters

console.log("Longest note again:", longestNote());
// Expected: same longest note

// countByCategory tests
console.log("Category counts:", countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

console.log("Category counts again:", countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }

// getSummary tests
console.log("Summary:", getSummary());
// Expected: 5 notes: 2 personal, 1 work, 2 study.

console.log("Summary again:", getSummary());
// Expected: 5 notes: 2 personal, 1 work, 2 study.

// isDuplicate tests
console.log("Duplicate check:", isDuplicate("Call mum"));
// Expected: true

console.log("Non-duplicate check:", isDuplicate("Go to the gym"));
// Expected: false

// addNote tests
console.log("Add valid note:", addNote("Buy a notebook", "personal"));
// Expected: true

console.log("Add duplicate note:", addNote("  CALL MUM  ", "personal"));
// Expected: false