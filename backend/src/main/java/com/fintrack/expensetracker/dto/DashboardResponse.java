package com.fintrack.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private KpiSummary kpis;
    private List<CategoryBreakdownItem> categoryBreakdown;
    private List<CashFlowPoint> cashFlowTrend;
    private List<BudgetHealthItem> budgetHealth;
    private List<TransactionResponse> recentTransactions;
    private List<PaymentMethodBreakdownItem> paymentMethodBreakdown;
    private SharedExpenseSummary sharedSummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiSummary {
        private BigDecimal totalBalance;
        private double balanceDeltaPct;
        private BigDecimal monthlyIncome;
        private double incomeDeltaPct;
        private BigDecimal monthlyExpenses;
        private double expensesDeltaPct;
        private double savingsRate;
        private double savingsRateDeltaPct;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdownItem {
        private Long categoryId;
        private String name;
        private String color;
        private String icon;
        private BigDecimal amount;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashFlowPoint {
        private String label;
        private BigDecimal income;
        private BigDecimal expenses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetHealthItem {
        private Long categoryId;
        private String categoryName;
        private String color;
        private String icon;
        private BigDecimal spent;
        private BigDecimal limit;
        private double utilizationPercent;
        private String status; // HEALTHY, WARNING, EXCEEDED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodBreakdownItem {
        private String paymentMethod;
        private String label;
        private BigDecimal total;
        private long count;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SharedExpenseSummary {
        private BigDecimal totalSharedAmount;
        private long sharedTransactionCount;
        private BigDecimal recurringMonthlyTotal;
        private long recurringCount;
    }
}
