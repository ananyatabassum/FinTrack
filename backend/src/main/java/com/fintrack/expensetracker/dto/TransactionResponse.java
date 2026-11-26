package com.fintrack.expensetracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fintrack.expensetracker.entity.PaymentMethod;
import com.fintrack.expensetracker.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String title;
    private BigDecimal amount;
    private TransactionType type;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private PaymentMethod paymentMethod;
    private LocalDate date;
    private String notes;
    @JsonProperty("isRecurring")
    private boolean isRecurring;
    private String splitWith;
}
