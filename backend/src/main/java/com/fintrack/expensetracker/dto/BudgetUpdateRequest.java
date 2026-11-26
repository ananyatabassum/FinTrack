package com.fintrack.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetUpdateRequest {
    @DecimalMin(value = "0.00", message = "Monthly budget must be 0 or greater")
    private BigDecimal monthlyBudget;
}
