// js/game.js

requireLogin();

// ─── CONSTANTS ───────────────────────────────────────────────────
const TOTAL_ROUNDS    = 10;
const WORDS_PER_ROUND = 6;
const GRID_SIZE       = 15;

// Timer per round — decreases by 10 seconds each round
const ROUND_TIME = 120;

// ─── STATE ───────────────────────────────────────────────────────
let grid          = [];
let allWords      = [];       // all words fetched from backend
let roundWords    = [];       // 6 words for current round
let shuffledWords = [];       // all words shuffled once at start
let foundWords    = new Set();
let category      = null;

let isSelecting   = false;
let startCell     = null;
let selectedCells = [];

let timerInterval  = null;
let timeRemaining  = 0;
let score          = 0;
let currentRound   = 1;
let totalTimeTaken = 0;       // cumulative time across all rounds

// ─── INIT ────────────────────────────────────────────────────────
const init = async () => {
    category = JSON.parse(localStorage.getItem('selectedCategory') || 'null');
    if (!category) {
        window.location.href = '/dashboard.html';
        return;
    }

    // Set nav username and category name
    document.getElementById('navUser').textContent      = getUser().username || '';
    document.getElementById('categoryName').textContent = category.name;

    // Fetch all words for this category from backend
    const fetchedWords = await getWordsByCategory(category.id);
    if (!fetchedWords || fetchedWords.length === 0) {
        alert('No words found for this category!');
        window.location.href = '/dashboard.html';
        return;
    }

    allWords = fetchedWords;

    // Shuffle all words once at the start
    shuffledWords = shuffleArray([...allWords]);

    // Start Round 1
    startRound(1);
};

// ─── ROUND MANAGEMENT ────────────────────────────────────────────

const startRound = (round) => {
    currentRound = round;
    foundWords.clear();
    isSelecting   = false;
    startCell     = null;
    selectedCells = [];

    // Update round display
    document.getElementById('roundDisplay').textContent  = `Round ${round}/${TOTAL_ROUNDS}`;
    document.getElementById('foundCount').textContent    = `0/${WORDS_PER_ROUND}`;
    document.getElementById('scoreDisplay').textContent  = score;

    // Pick 6 words for this round
    roundWords = getRoundWords(round);

    // Build and render game
    generateGrid();
    renderGrid();
    renderWordList();

    // Start countdown timer for this round
    startCountdown(ROUND_TIME);
};

// Get 6 words for the given round
// Cycles through shuffledWords using round index
const getRoundWords = (round) => {
    const startIndex = ((round - 1) * WORDS_PER_ROUND) % shuffledWords.length;

    let selected = [];
    for (let i = 0; i < WORDS_PER_ROUND; i++) {
        const index = (startIndex + i) % shuffledWords.length;
        selected.push(shuffledWords[index]);
    }
    return selected;
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// ─── COUNTDOWN TIMER ─────────────────────────────────────────────

const startCountdown = (seconds) => {
    stopTimer();
    timeRemaining = seconds;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        // Change timer color to red when under 10 seconds
        const timerEl = document.getElementById('timer');
        if (timeRemaining <= 10) {
            timerEl.style.color = '#f44336';
        } else if (timeRemaining <= 30) {
            timerEl.style.color = '#FF9800';
        } else {
            timerEl.style.color = '';
        }

        // Time's up — game over
        if (timeRemaining <= 0) {
            stopTimer();
            onTimeUp();
        }
    }, 1000);
};

const updateTimerDisplay = () => {
    const mins = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
    const secs = String(timeRemaining % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${mins}:${secs}`;
};

const stopTimer = () => {
    clearInterval(timerInterval);
};

// ─── TIME UP ─────────────────────────────────────────────────────

const onTimeUp = () => {
    stopTimer();

    // Show game over modal
    document.getElementById('gameOverRound').textContent  = currentRound;
    document.getElementById('gameOverScore').textContent  = score;
    document.getElementById('gameOverModal').classList.remove('hidden');
};

// ─── GRID GENERATION ─────────────────────────────────────────────

const DIRECTIONS = [
    [0,  1],  // right
    [1,  0],  // down
    [1,  1],  // diagonal down-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1,-1],  // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1],  // diagonal up-right
];

const generateGrid = () => {
    grid = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill('')
    );

    // Place each of the 6 round words
    for (const wordObj of roundWords) {
        const word = wordObj.germanWord.toUpperCase().replace(/\s/g, '');
        placeWord(word);
    }

    // Fill empty cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }
};

const placeWord = (word, attempts = 0) => {
    if (attempts > 200) return false;

    const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);

    const endRow = row + dr * (word.length - 1);
    const endCol = col + dc * (word.length - 1);

    if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) {
        return placeWord(word, attempts + 1);
    }

    for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
            return placeWord(word, attempts + 1);
        }
    }

    for (let i = 0; i < word.length; i++) {
        grid[row + dr * i][col + dc * i] = word[i];
    }

    return true;
};

// ─── RENDER GRID ─────────────────────────────────────────────────

const renderGrid = () => {
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    gameGrid.innerHTML = '';

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className   = 'grid-cell';
            cell.textContent = grid[r][c];
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener('mousedown', onMouseDown);
            cell.addEventListener('mouseover', onMouseOver);
            cell.addEventListener('mouseup',   onMouseUp);

            cell.addEventListener('touchstart', onTouchStart, { passive: true });
            cell.addEventListener('touchmove',  onTouchMove,  { passive: true });
            cell.addEventListener('touchend',   onTouchEnd);

            gameGrid.appendChild(cell);
        }
    }

    gameGrid.addEventListener('mouseleave', () => {
        if (isSelecting) clearSelection();
    });
};

// ─── RENDER WORD LIST ─────────────────────────────────────────────

const renderWordList = () => {
    const list = document.getElementById('wordList');
    list.innerHTML = roundWords.map(w => `
        <li id="word-${w.germanWord}" class="word-item">
            <span class="german-word">${w.germanWord}</span>
            <span class="english-word">${w.englishTranslation}</span>
        </li>
    `).join('');
};

// ─── MOUSE SELECTION ─────────────────────────────────────────────

const onMouseDown = (e) => {
    isSelecting   = true;
    startCell     = getCellCoords(e.target);
    selectedCells = [startCell];
    highlightCells([startCell]);
};

const onMouseOver = (e) => {
    if (!isSelecting) return;
    const current = getCellCoords(e.target);
    const line    = getCellsInLine(startCell, current);
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
    isSelecting   = true;
    startCell     = getCellCoords(e.target);
    selectedCells = [startCell];
    highlightCells([startCell]);
};

const onTouchMove = (e) => {
    if (!isSelecting) return;
    const touch = e.touches[0];
    const el    = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el || !el.classList.contains('grid-cell')) return;
    const current = getCellCoords(el);
    const line    = getCellsInLine(startCell, current);
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

const getCellsInLine = (start, end) => {
    const dr    = end.row - start.row;
    const dc    = end.col - start.col;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    if (steps === 0) return [start];

    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
        return [start];
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
    isSelecting   = false;
    startCell     = null;
    selectedCells = [];
};

// ─── CHECK SELECTION ─────────────────────────────────────────────

const checkSelection = () => {
    const selectedWord         = selectedCells.map(({ row, col }) => grid[row][col]).join('');
    const selectedWordReversed = selectedWord.split('').reverse().join('');

    let matched = null;
    for (const wordObj of roundWords) {
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
        // Mark cells permanently green
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

        // Score = base points + time bonus
        const timeBonus = Math.floor(timeRemaining * 2);
        score += 100 + timeBonus;
        document.getElementById('scoreDisplay').textContent = score;

        // Update found count
        document.getElementById('foundCount').textContent =
            `${foundWords.size}/${WORDS_PER_ROUND}`;

        // Check if all 6 words found — round complete
        if (foundWords.size === WORDS_PER_ROUND) {
            onRoundComplete();
        }

    } else {
        // Wrong — flash red
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
    startCell     = null;
};

// ─── ROUND COMPLETE ───────────────────────────────────────────────

const onRoundComplete = () => {
    stopTimer();

    // Add time bonus for remaining time
    const roundTimeTaken = ROUND_TIME[currentRound - 1] - timeRemaining;
    totalTimeTaken += roundTimeTaken;

    // Last round completed — full game win!
    if (currentRound === TOTAL_ROUNDS) {
        onGameWin();
        return;
    }

    // Show round complete modal
    document.getElementById('completedRound').textContent  = currentRound;
    document.getElementById('nextRound').textContent       = currentRound + 1;
    document.getElementById('roundScore').textContent      = score;
    document.getElementById('nextTimerValue').textContent  = ROUND_TIME; // next round timer
    document.getElementById('roundModal').classList.remove('hidden');
};

// Called when player clicks "Next Round" button
const goToNextRound = () => {
    document.getElementById('roundModal').classList.add('hidden');
    startRound(currentRound + 1);
};

// ─── GAME WIN (all 10 rounds complete) ───────────────────────────

const onGameWin = async () => {
    stopTimer();

    const mins = String(Math.floor(totalTimeTaken / 60)).padStart(2, '0');
    const secs = String(totalTimeTaken % 60).padStart(2, '0');

    document.getElementById('finalTime').textContent  = `${mins}:${secs}`;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalWords').textContent =
        `${TOTAL_ROUNDS * WORDS_PER_ROUND}/${TOTAL_ROUNDS * WORDS_PER_ROUND}`;
    document.getElementById('winModal').classList.remove('hidden');

    // Submit result to backend
    try {
        await submitResult(
            category.id,
            score,
            totalTimeTaken,
            TOTAL_ROUNDS * WORDS_PER_ROUND,
            TOTAL_ROUNDS * WORDS_PER_ROUND,
            true
        );
    } catch (err) {
        console.error('Failed to submit result:', err);
    }
};

// ─── PLAY AGAIN ───────────────────────────────────────────────────

const playAgain = () => {
    document.getElementById('winModal').classList.add('hidden');
    document.getElementById('gameOverModal').classList.add('hidden');
    score          = 0;
    totalTimeTaken = 0;
    shuffledWords  = shuffleArray([...allWords]);
    startRound(1);
};

// ─── START ────────────────────────────────────────────────────────
init();