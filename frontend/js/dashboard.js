// User dashboard logic
// js/dashboard.js

requireLogin();

const user = getUser();
document.getElementById('welcomeUser').textContent = `Hi, ${user.username}!`;

// Load dashboard stats
const loadDashboard = async () => {
    const data = await getDashboard();
    document.getElementById('totalGames').textContent     = data.totalGames || 0;
    document.getElementById('completedGames').textContent = data.completedGames || 0;
    document.getElementById('totalScore').textContent     = data.totalScore || 0;
};

// Load categories and render as cards
const loadCategories = async () => {
    const categories = await getCategories();
    const grid = document.getElementById('categoriesGrid');

    if (categories.length === 0) {
        grid.innerHTML = '<p>No categories available yet.</p>';
        return;
    }

    grid.innerHTML = categories.map(cat => `
        <div class="category-card">
            <h3>${cat.name}</h3>
            <p>${cat.description}</p>
            <span class="badge badge-${cat.difficulty.toLowerCase()}">
                ${cat.difficulty}
            </span>
            <button onclick="startGame(${cat.id}, '${cat.name}')"
                class="btn-primary">
                Play Now
            </button>
        </div>
    `).join('');
};

// Navigate to game page with selected category
const startGame = (categoryId, categoryName) => {
    localStorage.setItem('selectedCategory', JSON.stringify({
        id: categoryId,
        name: categoryName
    }));
    window.location.href = '/game.html';
};

// Initialize
loadDashboard();
loadCategories();