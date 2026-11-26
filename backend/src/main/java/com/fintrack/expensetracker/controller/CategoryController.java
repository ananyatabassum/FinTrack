package com.fintrack.expensetracker.controller;

import com.fintrack.expensetracker.dto.BudgetUpdateRequest;
import com.fintrack.expensetracker.dto.CategoryRequest;
import com.fintrack.expensetracker.dto.CategoryResponse;
import com.fintrack.expensetracker.entity.User;
import com.fintrack.expensetracker.security.UserPrincipal;
import com.fintrack.expensetracker.service.AuthService;
import com.fintrack.expensetracker.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(categoryService.getCategories(principal.getId(), startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CategoryRequest request
    ) {
        User user = authService.getUserById(principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(principal.getId(), user, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(principal.getId(), id, request));
    }

    @PatchMapping("/{id}/budget")
    public ResponseEntity<CategoryResponse> updateBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody BudgetUpdateRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateBudget(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        categoryService.deleteCategory(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
