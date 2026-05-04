package backend.controller;

import backend.model.Category;
import backend.model.GameSession;
import backend.model.Leaderboard;
import backend.model.User;
import backend.dto.GameResultDTO;
import backend.repository.CategoryRepository;
import backend.repository.GameSessionRepository;
import backend.repository.LeaderboardRepository;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {

    private final GameSessionRepository gameSessionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LeaderboardRepository leaderboardRepository;

    // ─── SUBMIT GAME RESULT ──────────────────────────────────────
    @PostMapping("/submit-result")
    public ResponseEntity<String> submitResult(
            @RequestBody GameResultDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Get logged in user
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get category
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // ── Step 1: Save game session ────────────────────────────
        GameSession session = new GameSession();
        session.setUser(user);
        session.setCategory(category);
        session.setScore(dto.getScore());
        session.setTimeTaken(dto.getTimeTaken());
        session.setWordsFound(dto.getWordsFound());
        session.setTotalWords(dto.getTotalWords());
        session.setIsCompleted(dto.getIsCompleted());
        gameSessionRepository.save(session);

        // ── Step 2: Update leaderboard ───────────────────────────
        // Only update leaderboard if game was completed
        if (Boolean.TRUE.equals(dto.getIsCompleted())) {
            updateLeaderboard(user, category, dto.getScore(), dto.getTimeTaken());
        }

        return ResponseEntity.ok("Result saved successfully");
    }

    // ─── UPDATE LEADERBOARD LOGIC ────────────────────────────────
    private void updateLeaderboard(User user, Category category,
                                   Integer newScore, Integer newTime) {

        // Check if entry already exists for this user + category
        Optional<Leaderboard> existing =
                leaderboardRepository.findByUserIdAndCategoryId(
                        user.getId(), category.getId()
                );

        if (existing.isPresent()) {
            // Entry exists — update only if new score is better
            Leaderboard entry = existing.get();

            boolean isBetterScore = newScore > entry.getBestScore();
            boolean isSameScoreFasterTime = newScore.equals(entry.getBestScore())
                    && newTime < entry.getBestTime();

            if (isBetterScore || isSameScoreFasterTime) {
                entry.setBestScore(newScore);
                entry.setBestTime(newTime);
                leaderboardRepository.save(entry);
            }

        } else {
            // No entry yet — create a new one
            Leaderboard newEntry = new Leaderboard();
            newEntry.setUser(user);
            newEntry.setCategory(category);
            newEntry.setBestScore(newScore);
            newEntry.setBestTime(newTime);
            leaderboardRepository.save(newEntry);
        }
    }

    // ─── GET LEADERBOARD ─────────────────────────────────────────
    @GetMapping("/leaderboard")
    public ResponseEntity<List<Leaderboard>> getLeaderboard() {
        return ResponseEntity.ok(
                leaderboardRepository.findTop10ByOrderByBestScoreDesc()
        );
    }
}