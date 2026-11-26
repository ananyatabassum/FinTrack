package com.fintrack.expensetracker.service;

import com.fintrack.expensetracker.dto.PagedResponse;
import com.fintrack.expensetracker.dto.TransactionRequest;
import com.fintrack.expensetracker.dto.TransactionResponse;
import com.fintrack.expensetracker.entity.*;
import com.fintrack.expensetracker.exception.BadRequestException;
import com.fintrack.expensetracker.exception.ResourceNotFoundException;
import com.fintrack.expensetracker.repository.TransactionRepository;
import com.fintrack.expensetracker.repository.TransactionSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> getTransactions(
            Long userId,
            String keyword,
            TransactionType type,
            Long categoryId,
            PaymentMethod paymentMethod,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Order.desc("date"), Sort.Order.desc("id"))
        );

        Specification<Transaction> spec = TransactionSpecifications.withFilters(
                userId, keyword, type, categoryId, paymentMethod, startDate, endDate
        );

        Page<Transaction> txPage = transactionRepository.findAll(spec, pageable);
        List<TransactionResponse> items = txPage.getContent().stream()
                .map(TransactionService::toResponse)
                .toList();

        return PagedResponse.<TransactionResponse>builder()
                .content(items)
                .page(txPage.getNumber())
                .size(txPage.getSize())
                .totalElements(txPage.getTotalElements())
                .totalPages(txPage.getTotalPages())
                .last(txPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public String exportTransactionsCsv(
            Long userId,
            String keyword,
            TransactionType type,
            Long categoryId,
            PaymentMethod paymentMethod,
            LocalDate startDate,
            LocalDate endDate,
            String currency
    ) {
        Specification<Transaction> spec = TransactionSpecifications.withFilters(
                userId, keyword, type, categoryId, paymentMethod, startDate, endDate
        );
        List<Transaction> transactions = transactionRepository.findAll(
                spec,
                Sort.by(Sort.Order.desc("date"), Sort.Order.desc("id"))
        );

        String safeCurrency = (currency != null && !currency.isBlank()) ? currency.trim().toUpperCase() : "USD";
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Date,Title,Type,Category,Payment Method,Currency,Amount,Recurring,Split With,Notes\n");
        for (Transaction tx : transactions) {
            csv.append(tx.getId()).append(',')
                    .append(csvCell(tx.getDate().toString())).append(',')
                    .append(csvCell(tx.getTitle())).append(',')
                    .append(csvCell(tx.getType().name())).append(',')
                    .append(csvCell(tx.getCategory().getName())).append(',')
                    .append(csvCell(tx.getPaymentMethod().name())).append(',')
                    .append(csvCell(safeCurrency)).append(',')
                    .append(tx.getAmount().toPlainString()).append(',')
                    .append(tx.isRecurring() ? "Yes" : "No").append(',')
                    .append(csvCell(tx.getSplitWith() != null ? tx.getSplitWith() : "")).append(',')
                    .append(csvCell(tx.getNotes() != null ? tx.getNotes() : ""))
                    .append('\n');
        }
        return csv.toString();
    }

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        User user = authService.getUserById(userId);
        Category category = validateAndGetCategory(userId, request.getCategoryId(), request.getType());

        Transaction tx = Transaction.builder()
                .title(request.getTitle().trim())
                .amount(request.getAmount())
                .type(request.getType())
                .category(category)
                .paymentMethod(request.getPaymentMethod())
                .date(request.getDate())
                .notes(cleanOptional(request.getNotes()))
                .isRecurring(request.isRecurring())
                .splitWith(cleanOptional(request.getSplitWith()))
                .user(user)
                .build();

        return toResponse(transactionRepository.save(tx));
    }

    @Transactional
    public TransactionResponse updateTransaction(Long userId, Long id, TransactionRequest request) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Category category = validateAndGetCategory(userId, request.getCategoryId(), request.getType());

        tx.setTitle(request.getTitle().trim());
        tx.setAmount(request.getAmount());
        tx.setType(request.getType());
        tx.setCategory(category);
        tx.setPaymentMethod(request.getPaymentMethod());
        tx.setDate(request.getDate());
        tx.setNotes(cleanOptional(request.getNotes()));
        tx.setRecurring(request.isRecurring());
        tx.setSplitWith(cleanOptional(request.getSplitWith()));

        return toResponse(transactionRepository.save(tx));
    }

    @Transactional
    public void deleteTransaction(Long userId, Long id) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        transactionRepository.delete(tx);
    }

    private Category validateAndGetCategory(Long userId, Long categoryId, TransactionType type) {
        Category category = categoryService.getOwnedCategory(userId, categoryId);
        if (category.getType() != type) {
            throw new BadRequestException("Selected category belongs to " + category.getType() + " transactions");
        }
        return category;
    }

    private String cleanOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String csvCell(String value) {
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    public static TransactionResponse toResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .title(tx.getTitle())
                .amount(tx.getAmount())
                .type(tx.getType())
                .categoryId(tx.getCategory().getId())
                .categoryName(tx.getCategory().getName())
                .categoryColor(tx.getCategory().getColor())
                .categoryIcon(tx.getCategory().getIcon())
                .paymentMethod(tx.getPaymentMethod())
                .date(tx.getDate())
                .notes(tx.getNotes())
                .isRecurring(tx.isRecurring())
                .splitWith(tx.getSplitWith())
                .build();
    }
}
