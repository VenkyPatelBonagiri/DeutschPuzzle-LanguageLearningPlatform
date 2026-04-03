// js/leaderboard.js

const loadLeaderboard = async () => {
    const container = document.getElementById('leaderboardContent');

    try {
        const data = await getLeaderboard();

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span>🎮</span>
                    <p>No scores yet. Be the first to play!</p>
                    <a href="/dashboard.html" class="btn-primary"
                       style="width:auto;padding:12px 24px;
                              text-decoration:none;display:inline-block;">
                        Play Now
                    </a>
                </div>`;
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];

        // Get current logged in user (to highlight their row)
        const currentUser = getUser();

        container.innerHTML = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Category</th>
                        <th>Best Score</th>
                        <th>Best Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((entry, i) => {
                        const isCurrentUser =
                            entry.user?.username === currentUser?.username;

                        return `
                        <tr class="
                            ${i < 3 ? 'top-rank' : ''}
                            ${isCurrentUser ? 'my-row' : ''}
                        ">
                            <td class="rank-cell">
                                ${i < 3
                                    ? `<span class="medal">${medals[i]}</span>`
                                    : `<span class="rank-num">#${i + 1}</span>`
                                }
                            </td>
                            <td class="player-cell">
                                <div class="player-avatar">
                                    ${(entry.user?.username || 'Player')[0].toUpperCase()}
                                </div>
                                <span>
                                    ${entry.user?.username || 'Player'}
                                    ${isCurrentUser ? '<span class="you-badge">You</span>' : ''}
                                </span>
                            </td>
                            <td>${entry.category?.name || '—'}</td>
                            <td class="score-cell">${entry.bestScore}</td>
                            <td class="time-cell">${formatTime(entry.bestTime)}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>`;

    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <span>⚠️</span>
                <p>Failed to load leaderboard. Please try again.</p>
            </div>`;
        console.error('Leaderboard error:', err);
    }
};

const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
};

// Initialize
loadLeaderboard();