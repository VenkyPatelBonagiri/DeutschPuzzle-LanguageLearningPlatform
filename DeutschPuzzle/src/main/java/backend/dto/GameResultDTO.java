package backend.dto;

import lombok.Data;

@Data
public class GameResultDTO {
    private Long categoryId;
    private Integer score;
    private Integer timeTaken;
    private Integer wordsFound;
    private Integer totalWords;
    private Boolean isCompleted;
}