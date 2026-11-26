package com.fintrack.expensetracker.dto;

import com.fintrack.expensetracker.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    @Size(max = 80, message = "Category name cannot exceed 80 characters")
    private String name;

    @NotNull(message = "Category type is required")
    private TransactionType type;

    @NotBlank(message = "Color is required")
    @Size(max = 20)
    private String color;

    @NotBlank(message = "Icon is required")
    @Size(max = 40)
    private String icon;

    @DecimalMin(value = "0.00", message = "Monthly budget must be 0 or greater")
    private BigDecimal monthlyBudget;
}
