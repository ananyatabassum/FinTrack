package com.fintrack.expensetracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fintrack.expensetracker.entity.PaymentMethod;
import com.fintrack.expensetracker.entity.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 140, message = "Title cannot exceed 140 characters")
    private String title;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    @JsonProperty("isRecurring")
    private boolean isRecurring;

    @Size(max = 160, message = "Split with cannot exceed 160 characters")
    private String splitWith;
}
