package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Category;
import com.restaurant.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    // 모든 카테고리 조회
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    // ID로 카테고리 조회
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }
    
    // 새 카테고리 추가
    @PostMapping
    public Category createCategory(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.get("description");
        
        Category category = new Category(name, description);
        return categoryRepository.save(category);
    }
    
    // 카테고리 수정
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        
        String name = request.get("name");
        String description = request.get("description");
        
        category.setName(name);
        category.setDescription(description);
        
        Category updatedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(updatedCategory);
    }
    
    // 카테고리 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        
        categoryRepository.delete(category);
        return ResponseEntity.ok().build();
    }
} 