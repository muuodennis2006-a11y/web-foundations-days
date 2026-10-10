
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const status = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

const API_URL = "https://jsonplaceholder.typicode.com/users";

let users = [];

async function loadUsers() {
    loadButton.disabled = true;
    loadButton.textContent = "Loading...";
    status.textContent = "Loading users...";
    usersList.replaceChildren();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        users = data;

        renderUsers(getFilteredUsers());

        status.textContent = `Successfully loaded ${users.length} users.`;
    } catch (error) {
        status.textContent =
            "Unable to load users. Please check your connection and try again.";
        console.error("Error loading users:", error);
    } finally {
        loadButton.disabled = false;
        loadButton.textContent = "Load Users";
    }
}

function renderUsers(list) {
    usersList.replaceChildren();

    if (list.length === 0) {
        const message = document.createElement("li");
        message.textContent = "No users match your filter.";
        usersList.appendChild(message);
        return;
    }

    list.forEach(function (user) {
        const item = document.createElement("li");
        item.classList.add("user-card");

        const name = document.createElement("h3");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;

        const city = document.createElement("p");
        city.textContent = `City: ${user.address.city}`;

        const company = document.createElement("p");
        company.textContent = `Company: ${user.company.name}`;

        item.append(name, email, city, company);
        usersList.appendChild(item);
    });
}

function getFilteredUsers() {
    const searchText = filterInput.value.trim().toLowerCase();

    return users.filter(function (user) {
        return user.name.toLowerCase().includes(searchText);
    });
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", function () {
    renderUsers(getFilteredUsers());
});
