package backend.controller;

import backend.model.Category;
import backend.model.Word;
import backend.repository.CategoryRepository;
import backend.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final WordRepository wordRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrue());
    }

    @GetMapping("/{id}/words")
    public ResponseEntity<List<Word>> getWordsByCategory(@PathVariable Long id) {
        return ResponseEntity.ok(wordRepository.findByCategoryIdAndIsActiveTrue(id));
    }
}
