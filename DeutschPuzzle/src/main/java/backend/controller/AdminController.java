package backend.controller;

import backend.model.Category;
import backend.model.User;
import backend.model.Word;
import backend.repository.CategoryRepository;
import backend.repository.GameSessionRepository;
import backend.repository.UserRepository;
import backend.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final WordRepository wordRepository;
    private final GameSessionRepository gameSessionRepository;

    // ─── USER MANAGEMENT ───────────────────────────────────────

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Disable a user account
    @PutMapping("/users/{id}/disable")
    public ResponseEntity<String> disableUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok("User disabled successfully");
    }

    // Enable a user account
    @PutMapping("/users/{id}/enable")
    public ResponseEntity<String> enableUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
        return ResponseEntity.ok("User enabled successfully");
    }

    // Delete a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ─── CATEGORY MANAGEMENT ───────────────────────────────────

    // Get all categories (including inactive)
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    // Create new category
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(
            @RequestBody Category category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    // Update existing category
    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category updatedCategory) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(updatedCategory.getName());
        category.setDescription(updatedCategory.getDescription());
        category.setDifficulty(updatedCategory.getDifficulty());
        category.setGridSize(updatedCategory.getGridSize());
        category.setIsActive(updatedCategory.getIsActive());

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    // Delete category
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok("Category deleted successfully");
    }

    // ─── WORD MANAGEMENT ───────────────────────────────────────

    // Get all words for a category
    @GetMapping("/categories/{categoryId}/words")
    public ResponseEntity<List<Word>> getWords(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(
                wordRepository.findByCategoryIdAndIsActiveTrue(categoryId)
        );
    }

    // Add a new word to a category
    @PostMapping("/words")
    public ResponseEntity<Word> addWord(@RequestBody Map<String, Object> body) {

        Long categoryId = Long.valueOf(body.get("categoryId").toString());
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Word word = new Word();
        word.setCategory(category);
        word.setGermanWord(body.get("germanWord").toString().toUpperCase());
        word.setEnglishTranslation(body.get("englishTranslation").toString());
        word.setHint(body.get("hint") != null ? body.get("hint").toString() : null);

        return ResponseEntity.ok(wordRepository.save(word));
    }

    // Update a word
    @PutMapping("/words/{id}")
    public ResponseEntity<Word> updateWord(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Word word = wordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Word not found"));

        word.setGermanWord(body.get("germanWord").toString().toUpperCase());
        word.setEnglishTranslation(body.get("englishTranslation").toString());
        word.setHint(body.get("hint") != null ? body.get("hint").toString() : null);

        return ResponseEntity.ok(wordRepository.save(word));
    }

    // Delete a word
    @DeleteMapping("/words/{id}")
    public ResponseEntity<String> deleteWord(@PathVariable Long id) {
        wordRepository.deleteById(id);
        return ResponseEntity.ok("Word deleted successfully");
    }

    // ─── ANALYTICS ─────────────────────────────────────────────

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {

        Map<String, Object> analytics = new HashMap<>();

        // Total counts
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalCategories", categoryRepository.count());
        analytics.put("totalWords", wordRepository.count());
        analytics.put("totalGamesPlayed", gameSessionRepository.count());

        return ResponseEntity.ok(analytics);
    }
}
