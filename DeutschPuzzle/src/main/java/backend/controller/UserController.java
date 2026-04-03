package backend.controller;

import backend.model.GameSession;
import backend.model.Leaderboard;
import backend.model.User;
import backend.repository.GameSessionRepository;
import backend.repository.LeaderboardRepository;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final GameSessionRepository gameSessionRepository;
    private final LeaderboardRepository leaderboardRepository;

    // Get logged-in user's profile
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(profile);
    }

    // Get logged-in user's full game history
    @GetMapping("/history")
    public ResponseEntity<List<GameSession>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                gameSessionRepository.findByUserIdOrderByPlayedAtDesc(user.getId())
        );
    }

    // Get logged-in user's personal leaderboard entries
    @GetMapping("/my-scores")
    public ResponseEntity<List<Leaderboard>> getMyScores(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                leaderboardRepository.findByUserIdOrderByBestScoreDesc(user.getId())
        );
    }

    // Get logged-in user's dashboard summary
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<GameSession> sessions =
                gameSessionRepository.findByUserIdOrderByPlayedAtDesc(user.getId());

        long totalGames = sessions.size();
        long completedGames = sessions.stream()
                .filter(GameSession::getIsCompleted).count();
        int totalScore = sessions.stream()
                .mapToInt(GameSession::getScore).sum();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("username", user.getUsername());
        dashboard.put("totalGames", totalGames);
        dashboard.put("completedGames", completedGames);
        dashboard.put("totalScore", totalScore);

        return ResponseEntity.ok(dashboard);
    }
}