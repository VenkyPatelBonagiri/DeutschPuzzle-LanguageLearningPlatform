// js/api.js

const BASE_URL = 'http://localhost:8081/api';

// ─── HEADERS ────────────────────────────────────────────────────
// NOTE: getToken() and getUser() are defined in auth.js
// auth.js must be loaded BEFORE api.js uses these functions

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const publicHeaders = () => ({
    'Content-Type': 'application/json'
});

// ─── AUTH APIS ───────────────────────────────────────────────────
const register = async (username, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: publicHeaders(),
        body: JSON.stringify({ username, email, password })
    });
    return res.json();
};

const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: publicHeaders(),
        body: JSON.stringify({ email, password })
    });
    return res.json();
};

// ─── CATEGORY APIS ───────────────────────────────────────────────
const getCategories = async () => {
    const res = await fetch(`${BASE_URL}/categories`, {
        headers: publicHeaders()
    });
    return res.json();
};

const getWordsByCategory = async (categoryId) => {
    const res = await fetch(`${BASE_URL}/categories/${categoryId}/words`, {
        headers: publicHeaders()
    });
    return res.json();
};

// ─── GAME APIS ────────────────────────────────────────────────────
const submitResult = async (categoryId, score, timeTaken, wordsFound, totalWords, isCompleted) => {
    const res = await fetch(`${BASE_URL}/game/submit-result`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ categoryId, score, timeTaken, wordsFound, totalWords, isCompleted })
    });
    return res.json();
};

const getLeaderboard = async () => {
    const res = await fetch(`${BASE_URL}/game/leaderboard`, {
        headers: publicHeaders()
    });
    return res.json();
};

// ─── USER APIS ────────────────────────────────────────────────────
const getDashboard = async () => {
    const res = await fetch(`${BASE_URL}/user/dashboard`, {
        headers: authHeaders()
    });
    return res.json();
};

const getHistory = async () => {
    const res = await fetch(`${BASE_URL}/user/history`, {
        headers: authHeaders()
    });
    return res.json();
};

// ─── ADMIN APIS ───────────────────────────────────────────────────
const getAnalytics = async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
        headers: authHeaders()
    });
    return res.json();
};

const getAllUsers = async () => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
        headers: authHeaders()
    });
    return res.json();
};

const createCategory = async (name, description, difficulty, gridSize) => {
    const res = await fetch(`${BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, description, difficulty, gridSize, isActive: true })
    });
    return res.json();
};

const deleteCategory = async (id) => {
    const res = await fetch(`${BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return res.json();
};

const addWord = async (categoryId, germanWord, englishTranslation, hint) => {
    const res = await fetch(`${BASE_URL}/admin/words`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ categoryId, germanWord, englishTranslation, hint })
    });
    return res.json();
};

const deleteWord = async (id) => {
    const res = await fetch(`${BASE_URL}/admin/words/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    return res.json();
};