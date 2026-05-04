package backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "leaderboard",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "category_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Leaderboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Only expose username from User — ignore password and other sensitive fields
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "email", "isActive", "updatedAt", "createdAt"})
    private User user;

    // Only expose name from Category — ignore words list
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({"words", "isActive", "createdAt"})
    private Category category;

    private Integer bestScore = 0;
    private Integer bestTime;

    @UpdateTimestamp
    private LocalDateTime achievedAt;
}