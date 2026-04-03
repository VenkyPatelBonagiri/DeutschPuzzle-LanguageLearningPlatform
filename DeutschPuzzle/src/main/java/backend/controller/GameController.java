package backend.controller;

import backend.dto.GameResultDTO;
import backend.model.Category;
import backend.model.GameSession;
import backend.model.Leaderboard;
import backend.model.User;
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

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {

    private final GameSessionRepository gameSessionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LeaderboardRepository leaderboardRepository;

    @PostMapping("/submit-result")
    public ResponseEntity<String> submitResult(
            @RequestBody GameResultDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername()).get();
        Category category = categoryRepository.findById(dto.getCategoryId()).get();

        // Save game session
        GameSession session = new GameSession();
        session.setUser(user);
        session.setCategory(category);
        session.setScore(dto.getScore());
        session.setTimeTaken(dto.getTimeTaken());
        session.setWordsFound(dto.getWordsFound());
        session.setTotalWords(dto.getTotalWords());
        session.setIsCompleted(dto.getIsCompleted());
        gameSessionRepository.save(session);

        return ResponseEntity.ok("Result saved successfully");
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Leaderboard>> getLeaderboard() {
        return ResponseEntity.ok(leaderboardRepository.findTop10ByOrderByBestScoreDesc());
    }
}
