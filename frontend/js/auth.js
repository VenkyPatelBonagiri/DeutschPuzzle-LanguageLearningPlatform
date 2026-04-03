// Login, register, logout logic

// js/auth.js

const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
        username: data.username,
        role: data.role  // stores "ADMIN" or "USER"
    }));
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
};

const isLoggedIn = () => !!localStorage.getItem('token');

const isAdmin = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Handle both "ADMIN" and "ROLE_ADMIN" formats safely
        return user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
    } catch {
        return false;
    }
};

const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
        return {};
    }
};

const getToken = () => localStorage.getItem('token');

// Protect pages that require login
const requireLogin = () => {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
    }
};

// Protect pages that require admin
const requireAdmin = () => {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
    if (!isAdmin()) {
        // Not admin — redirect to user dashboard
        window.location.href = '/dashboard.html';
        return;
    }
};

// Handle Register Form
const handleRegister = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl  = document.getElementById('error');

    try {
        const data = await register(username, email, password);
        if (data.token) {
            saveSession(data);
            window.location.href = '/dashboard.html';
        } else {
            errorEl.textContent = data.message || 'Registration failed';
        }
    } catch (err) {
        errorEl.textContent = 'Something went wrong. Try again.';
    }
};

// Handle Login Form — redirect based on role
const handleLogin = async (e) => {
    e.preventDefault();
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl  = document.getElementById('error');

    try {
        const data = await login(email, password);
        if (data.token) {
            saveSession(data);

            // ← KEY FIX: redirect admin to admin panel, user to dashboard
            if (data.role === 'ADMIN' || data.role === 'ROLE_ADMIN') {
                window.location.href = '/admin/index.html';
            } else {
                window.location.href = '/dashboard.html';
            }
        } else {
            errorEl.textContent = data.message || 'Invalid credentials';
        }
    } catch (err) {
        errorEl.textContent = 'Something went wrong. Try again.';
    }
};