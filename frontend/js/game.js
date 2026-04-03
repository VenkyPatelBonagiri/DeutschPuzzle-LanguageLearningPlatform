// js/game.js
 
requireLogin();
 
// ─── STATE ──────────────────────────────────────────────────────
let grid        = [];       // 2D array of letters
let words       = [];       // word objects from API
let foundWords  = new Set();// set of found german words
let gridSize    = 10;       // grid dimensions
let category    = null;     // selected category object
 
let isSelecting = false;
let startCell   = null;
let selectedCells = [];
 
let timerInterval = null;
let secondsElapsed = 0;
let score = 0;
 
// ─── INIT ────────────────────────────────────────────────────────
const init = async () => {
    // Get selected category from localStorage
    category = JSON.parse(localStorage.getItem('selectedCategory') || 'null');
    if (!category) {
        window.location.href = '/dashboard.html';
        return;
    }
 
    // Set nav username
    const user = getUser();
    document.getElementById('navUser').textContent = user.username || '';
 
    // Set category name in header
    document.getElementById('categoryName').textContent = category.name;
 
    // Fetch words from backend
    const fetchedWords = await getWordsByCategory(category.id);
    if (!fetchedWords || fetchedWords.length === 0) {
        alert('No words found for this category!');
        window.location.href = '/dashboard.html';
        return;
    }
 
    words = fetchedWords;
    gridSize = Math.max(10, Math.ceil(Math.sqrt(words.length * 8)));
    if (gridSize > 15) gridSize = 15;
 
    // Set difficulty badge
    const badge = document.getElementById('difficultyBadge');
    badge.textContent = gridSize <= 10 ? 'EASY' : gridSize <= 12 ? 'MEDIUM' : 'HARD';
    badge.className = `badge badge-${badge.textContent.toLowerCase()}`;
 
    // Update found count
    document.getElementById('foundCount').textContent = `0/${words.length}`;
 
    // Build game
    generateGrid();
    renderGrid();
    renderWordList();
    startTimer();
};
 
// ─── GRID GENERATION ─────────────────────────────────────────────
 
const DIRECTIONS = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1],  // diagonal up-right
];
 
const generateGrid = () => {
    // Initialize empty grid
    grid = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill('')
    );
 
    // Place each word
    for (const wordObj of words) {
        const word = wordObj.germanWord.toUpperCase().replace(/\s/g, '');
        placeWord(word);
    }
 
    // Fill empty cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }
};
 
const placeWord = (word, attempts = 0) => {
    if (attempts > 200) return false; // give up after 200 tries
 
    const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
 
    // Check if word fits
    const endRow = row + dr * (word.length - 1);
    const endCol = col + dc * (word.length - 1);
 
    if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
        return placeWord(word, attempts + 1);
    }
 
    // Check for conflicts
    for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
            return placeWord(word, attempts + 1);
        }
    }
 
    // Place the word
    for (let i = 0; i < word.length; i++) {
        grid[row + dr * i][col + dc * i] = word[i];
    }
 
    return true;
};
 
// ─── RENDER GRID ─────────────────────────────────────────────────
 
const renderGrid = () => {
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameGrid.innerHTML = '';
 
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = grid[r][c];
            cell.dataset.row = r;
            cell.dataset.col = c;
 
            // Mouse events
            cell.addEventListener('mousedown',  onMouseDown);
            cell.addEventListener('mouseover',  onMouseOver);
            cell.addEventListener('mouseup',    onMouseUp);
 
            // Touch events
            cell.addEventListener('touchstart', onTouchStart, { passive: true });
            cell.addEventListener('touchmove',  onTouchMove,  { passive: true });
            cell.addEventListener('touchend',   onTouchEnd);
 
            gameGrid.appendChild(cell);
        }
    }
 
    // Prevent text selection while dragging
    gameGrid.addEventListener('mouseleave', () => {
        if (isSelecting) clearSelection();
    });
};
 
// ─── RENDER WORD LIST ─────────────────────────────────────────────
 
const renderWordList = () => {
    const list = document.getElementById('wordList');
    list.innerHTML = words.map(w => `
        <li id="word-${w.germanWord}" class="word-item">
            <span class="german-word">${w.germanWord}</span>
            <span class="english-word">${w.englishTranslation}</span>
        </li>
    `).join('');
};
 
// ─── MOUSE SELECTION ─────────────────────────────────────────────
 
const onMouseDown = (e) => {
    isSelecting = true;
    startCell = getCellCoords(e.target);
    selectedCells = [startCell];
    highlightCells([startCell]);
};
 
const onMouseOver = (e) => {
    if (!isSelecting) return;
    const current = getCellCoords(e.target);
    const line = getCellsInLine(startCell, current);
    selectedCells = line;
    clearHighlight();
    highlightCells(line);
};
 
const onMouseUp = () => {
    if (!isSelecting) return;
    isSelecting = false;
    checkSelection();
};
 
// ─── TOUCH SELECTION ─────────────────────────────────────────────
 
const onTouchStart = (e) => {
    isSelecting = true;
    startCell = getCellCoords(e.target);
    selectedCells = [startCell];
    highlightCells([startCell]);
};
 
const onTouchMove = (e) => {
    if (!isSelecting) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el || !el.classList.contains('grid-cell')) return;
    const current = getCellCoords(el);
    const line = getCellsInLine(startCell, current);
    selectedCells = line;
    clearHighlight();
    highlightCells(line);
};
 
const onTouchEnd = () => {
    if (!isSelecting) return;
    isSelecting = false;
    checkSelection();
};
 
// ─── CELL HELPERS ────────────────────────────────────────────────
 
const getCellCoords = (el) => ({
    row: parseInt(el.dataset.row),
    col: parseInt(el.dataset.col)
});
 
const getCellElement = (row, col) =>
    document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
 
// Get all cells in a straight line between start and end
const getCellsInLine = (start, end) => {
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
 
    if (steps === 0) return [start];
 
    // Normalize direction
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
 
    // Only allow straight lines (horizontal, vertical, diagonal)
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
        return [start]; // not a straight diagonal
    }
 
    const cells = [];
    for (let i = 0; i <= steps; i++) {
        cells.push({
            row: start.row + stepR * i,
            col: start.col + stepC * i
        });
    }
    return cells;
};
 
// ─── HIGHLIGHT ────────────────────────────────────────────────────
 
const highlightCells = (cells) => {
    cells.forEach(({ row, col }) => {
        const el = getCellElement(row, col);
        if (el) el.classList.add('selecting');
    });
};
 
const clearHighlight = () => {
    document.querySelectorAll('.grid-cell.selecting')
        .forEach(el => el.classList.remove('selecting'));
};
 
const clearSelection = () => {
    clearHighlight();
    isSelecting = false;
    startCell = null;
    selectedCells = [];
};
 
// ─── CHECK SELECTION ─────────────────────────────────────────────
 
const checkSelection = () => {
    // Build word from selected cells
    const selectedWord = selectedCells
        .map(({ row, col }) => grid[row][col])
        .join('');
 
    const selectedWordReversed = selectedWord.split('').reverse().join('');
 
    // Check against word list
    let matched = null;
    for (const wordObj of words) {
        const target = wordObj.germanWord.toUpperCase().replace(/\s/g, '');
        if (
            (selectedWord === target || selectedWordReversed === target) &&
            !foundWords.has(wordObj.germanWord)
        ) {
            matched = wordObj;
            break;
        }
    }
 
    if (matched) {
        // Mark cells as found (permanent green)
        selectedCells.forEach(({ row, col }) => {
            const el = getCellElement(row, col);
            if (el) {
                el.classList.remove('selecting');
                el.classList.add('found');
            }
        });
 
        // Mark word in list as found
        foundWords.add(matched.germanWord);
        const wordEl = document.getElementById(`word-${matched.germanWord}`);
        if (wordEl) wordEl.classList.add('found');
 
        // Update score
        score += Math.max(100, 500 - secondsElapsed * 2);
        document.getElementById('scoreDisplay').textContent = score;
 
        // Update found count
        document.getElementById('foundCount').textContent =
            `${foundWords.size}/${words.length}`;
 
        // Check win condition
        if (foundWords.size === words.length) {
            onGameWin();
        }
    } else {
        // Wrong selection — flash red then clear
        selectedCells.forEach(({ row, col }) => {
            const el = getCellElement(row, col);
            if (el) {
                el.classList.remove('selecting');
                el.classList.add('wrong');
                setTimeout(() => el.classList.remove('wrong'), 500);
            }
        });
    }
 
    selectedCells = [];
    startCell = null;
};
 
// ─── TIMER ───────────────────────────────────────────────────────
 
const startTimer = () => {
    secondsElapsed = 0;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const secs = String(secondsElapsed % 60).padStart(2, '0');
        document.getElementById('timer').textContent = `${mins}:${secs}`;
    }, 1000);
};
 
const stopTimer = () => {
    clearInterval(timerInterval);
};
 
// ─── WIN ─────────────────────────────────────────────────────────
 
const onGameWin = async () => {
    stopTimer();
 
    // Show modal
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
 
    document.getElementById('finalTime').textContent  = `${mins}:${secs}`;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalWords').textContent = `${words.length}/${words.length}`;
    document.getElementById('winModal').classList.remove('hidden');
 
    // Submit result to backend
    try {
        await submitResult(
            category.id,
            score,
            secondsElapsed,
            foundWords.size,
            words.length,
            true
        );
    } catch (err) {
        console.error('Failed to submit result:', err);
    }
};
 
const playAgain = () => {
    document.getElementById('winModal').classList.add('hidden');
    foundWords.clear();
    score = 0;
    secondsElapsed = 0;
    document.getElementById('scoreDisplay').textContent = '0';
    document.getElementById('foundCount').textContent = `0/${words.length}`;
    document.querySelectorAll('.word-item').forEach(el => el.classList.remove('found'));
    generateGrid();
    renderGrid();
    startTimer();
};
 
// ─── START ────────────────────────────────────────────────────────
init();
 