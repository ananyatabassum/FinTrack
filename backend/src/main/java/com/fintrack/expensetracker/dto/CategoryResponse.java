package com.fintrack.expensetracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fintrack.expensetracker.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private TransactionType type;
    private String color;
    private String icon;
    private BigDecimal monthlyBudget;
    @JsonProperty("isDefault")
    private boolean isDefault;
    private BigDecimal spentInPeriod;
    private Double utilizationPercent;
    private long transactionCount;
}
