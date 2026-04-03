package backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty = Difficulty.MEDIUM;

    private Integer gridSize = 10;

    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @JsonIgnore  // ADD THIS — prevents infinite loop when serializing to JSON
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Word> words;

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}