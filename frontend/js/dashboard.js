// js/dashboard.js

requireLogin();

const user = getUser();
document.getElementById('welcomeUser').textContent = `Hi, ${user.username}!`;

// Load dashboard stats
const loadDashboard = async () => {
    try {
        const data = await getDashboard();
        document.getElementById('totalGames').textContent     = data.totalGames     || 0;
        document.getElementById('completedGames').textContent = data.completedGames || 0;
        document.getElementById('totalScore').textContent     = data.totalScore     || 0;
    } catch (err) {
        console.error('Failed to load dashboard stats:', err);
    }
};

// Load categories and render as cards
const loadCategories = async () => {
    const grid = document.getElementById('categoriesGrid');

    try {
        const categories = await getCategories();

        if (!categories || categories.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <span>📭</span>
                    <p>No categories available yet. Check back soon!</p>
                </div>`;
            return;
        }

        grid.innerHTML = categories.map(cat => `
            <div class="category-card">
                <h3>${cat.name}</h3>
                <p>${cat.description || 'Find hidden German words!'}</p>
                <div class="category-meta">
                    <span class="rounds-info">🔄 10 Rounds</span>
                </div>
                <button
                    onclick="startGame(${cat.id}, '${cat.name}')"
                    class="btn-primary">
                    Play Now
                </button>
            </div>
        `).join('');

    } catch (err) {
        grid.innerHTML = `
            <div class="empty-state">
                <span>⚠️</span>
                <p>Failed to load categories. Please refresh.</p>
            </div>`;
        console.error('Failed to load categories:', err);
    }
};

// Navigate to game page with selected category
// difficulty and gridSize removed — no longer needed
const startGame = (categoryId, categoryName) => {
    localStorage.setItem('selectedCategory', JSON.stringify({
        id:   categoryId,
        name: categoryName
    }));
    window.location.href = '/game.html';
};

// Initialize
loadDashboard();
loadCategories();