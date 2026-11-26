package com.fintrack.expensetracker.service;

import com.fintrack.expensetracker.dto.BudgetUpdateRequest;
import com.fintrack.expensetracker.dto.CategoryRequest;
import com.fintrack.expensetracker.dto.CategoryResponse;
import com.fintrack.expensetracker.entity.Category;
import com.fintrack.expensetracker.entity.Transaction;
import com.fintrack.expensetracker.entity.TransactionType;
import com.fintrack.expensetracker.entity.User;
import com.fintrack.expensetracker.exception.BadRequestException;
import com.fintrack.expensetracker.exception.DuplicateResourceException;
import com.fintrack.expensetracker.exception.ResourceNotFoundException;
import com.fintrack.expensetracker.repository.CategoryRepository;
import com.fintrack.expensetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    private record DefaultCategorySpec(
            String name,
            TransactionType type,
            String color,
            String icon,
            BigDecimal monthlyBudget
    ) {
    }

    private static final List<DefaultCategorySpec> DEFAULT_CATEGORIES = List.of(
            new DefaultCategorySpec("Food & Dining", TransactionType.EXPENSE, "#F59E0B", "utensils", new BigDecimal("650.00")),
            new DefaultCategorySpec("Housing & Rent", TransactionType.EXPENSE, "#6366F1", "home", new BigDecimal("1850.00")),
            new DefaultCategorySpec("Transport", TransactionType.EXPENSE, "#06B6D4", "car", new BigDecimal("320.00")),
            new DefaultCategorySpec("Utilities", TransactionType.EXPENSE, "#8B5CF6", "zap", new BigDecimal("240.00")),
            new DefaultCategorySpec("Subscriptions", TransactionType.EXPENSE, "#EC4899", "repeat", new BigDecimal("140.00")),
            new DefaultCategorySpec("Entertainment", TransactionType.EXPENSE, "#F43F5E", "film", new BigDecimal("220.00")),
            new DefaultCategorySpec("Health", TransactionType.EXPENSE, "#10B981", "heart-pulse", new BigDecimal("250.00")),
            new DefaultCategorySpec("Shopping", TransactionType.EXPENSE, "#3B82F6", "shopping-bag", new BigDecimal("400.00")),
            new DefaultCategorySpec("Salary", TransactionType.INCOME, "#10B981", "briefcase", null),
            new DefaultCategorySpec("Freelance", TransactionType.INCOME, "#14B8A6", "laptop", null)
    );

    @Transactional
    public List<Category> seedDefaultCategoriesForUser(User user) {
        List<Category> categories = DEFAULT_CATEGORIES.stream()
                .map(spec -> Category.builder()
                        .name(spec.name())
                        .type(spec.type())
                        .color(spec.color())
                        .icon(spec.icon())
                        .monthlyBudget(spec.monthlyBudget())
                        .isDefault(true)
                        .user(user)
                        .build())
                .toList();
        return categoryRepository.saveAll(categories);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDate effectiveStart = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate effectiveEnd = endDate != null ? endDate : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());

        List<Category> categories = categoryRepository.findByUserIdOrderByTypeAscNameAsc(userId);
        List<Transaction> periodTransactions = transactionRepository
                .findByUserIdAndDateBetweenOrderByDateAscIdAsc(userId, effectiveStart, effectiveEnd);

        Map<Long, BigDecimal> amountByCategory = periodTransactions.stream()
                .collect(Collectors.groupingBy(
                        tx -> tx.getCategory().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        Map<Long, Long> countByCategory = periodTransactions.stream()
                .collect(Collectors.groupingBy(tx -> tx.getCategory().getId(), Collectors.counting()));

        return categories.stream()
                .map(cat -> toResponse(
                        cat,
                        amountByCategory.getOrDefault(cat.getId(), BigDecimal.ZERO),
                        countByCategory.getOrDefault(cat.getId(), 0L)
                ))
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(Long userId, User user, CategoryRequest request) {
        String trimmedName = request.getName().trim();
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, trimmedName)) {
            throw new DuplicateResourceException("A category named '" + trimmedName + "' already exists");
        }

        BigDecimal budget = request.getType() == TransactionType.EXPENSE ? request.getMonthlyBudget() : null;
        Category category = Category.builder()
                .name(trimmedName)
                .type(request.getType())
                .color(request.getColor().trim())
                .icon(request.getIcon().trim())
                .monthlyBudget(budget)
                .isDefault(false)
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        return toResponse(saved, BigDecimal.ZERO, 0L);
    }

    @Transactional
    public CategoryResponse updateCategory(Long userId, Long id, CategoryRequest request) {
        Category category = getOwnedCategory(userId, id);
        String trimmedName = request.getName().trim();

        if (!category.getName().equalsIgnoreCase(trimmedName)
                && categoryRepository.existsByUserIdAndNameIgnoreCase(userId, trimmedName)) {
            throw new DuplicateResourceException("A category named '" + trimmedName + "' already exists");
        }

        category.setName(trimmedName);
        category.setType(request.getType());
        category.setColor(request.getColor().trim());
        category.setIcon(request.getIcon().trim());
        category.setMonthlyBudget(request.getType() == TransactionType.EXPENSE ? request.getMonthlyBudget() : null);

        Category saved = categoryRepository.save(category);
        return computeSingleCategoryResponse(userId, saved);
    }

    @Transactional
    public CategoryResponse updateBudget(Long userId, Long id, BudgetUpdateRequest request) {
        Category category = getOwnedCategory(userId, id);
        if (category.getType() != TransactionType.EXPENSE) {
            throw new BadRequestException("Monthly budget caps can only be set on expense categories");
        }
        category.setMonthlyBudget(request.getMonthlyBudget());
        Category saved = categoryRepository.save(category);
        return computeSingleCategoryResponse(userId, saved);
    }

    @Transactional
    public void deleteCategory(Long userId, Long id) {
        Category category = getOwnedCategory(userId, id);
        if (transactionRepository.existsByCategoryId(category.getId())) {
            throw new BadRequestException("Cannot delete a category that has existing transactions");
        }
        categoryRepository.delete(category);
    }

    public Category getOwnedCategory(Long userId, Long categoryId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private CategoryResponse computeSingleCategoryResponse(Long userId, Category category) {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        List<Transaction> txs = transactionRepository.findByUserIdAndDateBetweenOrderByDateAscIdAsc(userId, start, end);

        BigDecimal spent = txs.stream()
                .filter(tx -> tx.getCategory().getId().equals(category.getId()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long count = txs.stream()
                .filter(tx -> tx.getCategory().getId().equals(category.getId()))
                .count();

        return toResponse(category, spent, count);
    }

    private CategoryResponse toResponse(Category cat, BigDecimal spent, long count) {
        Double utilization = null;
        if (cat.getMonthlyBudget() != null && cat.getMonthlyBudget().compareTo(BigDecimal.ZERO) > 0) {
            utilization = spent
                    .multiply(BigDecimal.valueOf(100))
                    .divide(cat.getMonthlyBudget(), 1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .type(cat.getType())
                .color(cat.getColor())
                .icon(cat.getIcon())
                .monthlyBudget(cat.getMonthlyBudget())
                .isDefault(cat.isDefault())
                .spentInPeriod(spent)
                .utilizationPercent(utilization)
                .transactionCount(count)
                .build();
    }
}
