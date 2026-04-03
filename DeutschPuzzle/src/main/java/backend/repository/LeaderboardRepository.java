package backend.repository;


import backend.model.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {

    // Get top 10 players by best score (for global leaderboard)
    List<Leaderboard> findTop10ByOrderByBestScoreDesc();

    // Get top 10 players by best score in a specific category
    List<Leaderboard> findTop10ByCategoryIdOrderByBestScoreDesc(Long categoryId);

    // Find a specific user's leaderboard entry for a category
    Optional<Leaderboard> findByUserIdAndCategoryId(Long userId, Long categoryId);

    // Get all leaderboard entries for a specific user
    List<Leaderboard> findByUserIdOrderByBestScoreDesc(Long userId);
}