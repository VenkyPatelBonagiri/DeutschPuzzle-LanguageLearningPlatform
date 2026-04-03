// js/admin.js
 
// Toggle user active/inactive
const toggleUser = async (userId, isCurrentlyActive) => {
    const action = isCurrentlyActive ? 'disable' : 'enable';
    const confirmed = confirm(
        `Are you sure you want to ${action} this user?`
    );
    if (!confirmed) return;
 
    const res = await fetch(
        `${BASE_URL}/admin/users/${userId}/${action}`,
        { method: 'PUT', headers: authHeaders() }
    );
 
    if (res.ok) {
        alert(`User ${action}d successfully`);
        window.location.reload();
    } else {
        alert(`Failed to ${action} user`);
    }
};
 
// Load categories table (used in categories.html)
const loadCategoriesTable = async () => {
    const categories = await fetch(
        `${BASE_URL}/admin/categories`,
        { headers: authHeaders() }
    ).then(r => r.json());
 
    const tbody = document.getElementById('categoriesTable');
    if (!tbody) return;
 
    if (!categories || categories.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    No categories yet. Add one above!
                </td>
            </tr>`;
        return;
    }
 
    tbody.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td><strong>${cat.name}</strong></td>
            <td>${cat.description || '—'}</td>
            <td>
                <span class="badge badge-${cat.difficulty.toLowerCase()}">
                    ${cat.difficulty}
                </span>
            </td>
            <td>${cat.gridSize}×${cat.gridSize}</td>
            <td>
                <span class="status-badge ${cat.isActive ? 'status-active' : 'status-inactive'}">
                    ${cat.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button
                    onclick="deleteCategoryById(${cat.id}, '${cat.name}')"
                    class="btn-table btn-table-danger">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
};
 
// Delete category
const deleteCategoryById = async (id, name) => {
    const confirmed = confirm(
        `Delete category "${name}"? This will also delete all its words!`
    );
    if (!confirmed) return;
 
    await deleteCategory(id);
    loadCategoriesTable();
};
 
// Load words table (used in words.html)
const loadWordsTable = async () => {
    const categoryId = document.getElementById('categoryFilter')?.value;
    const tbody = document.getElementById('wordsTable');
    if (!tbody) return;
 
    tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Loading...</td></tr>`;
 
    // If no category selected, show all categories' words
    const categories = categoryId
        ? [{ id: categoryId }]
        : await getCategories();
 
    let allWords = [];
    for (const cat of categories) {
        const words = await fetch(
            `${BASE_URL}/admin/categories/${cat.id}/words`,
            { headers: authHeaders() }
        ).then(r => r.json());
 
        // Attach category name
        const catName = cat.name || categoryId;
        words.forEach(w => w.categoryName = catName || `Category ${cat.id}`);
        allWords = allWords.concat(words);
    }
 
    if (allWords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    No words found. Add some above!
                </td>
            </tr>`;
        return;
    }
 
    tbody.innerHTML = allWords.map(w => `
        <tr>
            <td>${w.id}</td>
            <td><strong>${w.germanWord}</strong></td>
            <td>${w.englishTranslation}</td>
            <td>${w.hint || '—'}</td>
            <td>${w.categoryName}</td>
            <td>
                <button
                    onclick="deleteWordById(${w.id}, '${w.germanWord}')"
                    class="btn-table btn-table-danger">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
};
 
// Delete word
const deleteWordById = async (id, word) => {
    const confirmed = confirm(`Delete word "${word}"?`);
    if (!confirmed) return;
 
    await deleteWord(id);
    loadWordsTable();
};