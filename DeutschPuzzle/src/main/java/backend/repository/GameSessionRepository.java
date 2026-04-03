package backend.repository;

import backend.model.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    List<GameSession> findByUserIdOrderByPlayedAtDesc(Long userId);
    Long countByCategoryId(Long categoryId);

    @Query("SELECT AVG(g.timeTaken) FROM GameSession g WHERE g.category.id = :categoryId")
    Double findAvgTimeByCategoryId(@Param("categoryId") Long categoryId);
}
