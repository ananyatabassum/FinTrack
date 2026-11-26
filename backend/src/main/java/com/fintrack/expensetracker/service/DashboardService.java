package com.fintrack.expensetracker.service;

import com.fintrack.expensetracker.dto.DashboardResponse;
import com.fintrack.expensetracker.dto.DashboardResponse.*;
import com.fintrack.expensetracker.dto.TransactionResponse;
import com.fintrack.expensetracker.entity.Category;
import com.fintrack.expensetracker.entity.PaymentMethod;
import com.fintrack.expensetracker.entity.Transaction;
import com.fintrack.expensetracker.entity.TransactionType;
import com.fintrack.expensetracker.repository.CategoryRepository;
import com.fintrack.expensetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("MMM dd");
    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("MMM yyyy");

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDate effectiveStart = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate effectiveEnd = endDate != null ? endDate : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        if (effectiveEnd.isBefore(effectiveStart)) {
            LocalDate tmp = effectiveStart;
            effectiveStart = effectiveEnd;
            effectiveEnd = tmp;
        }

        // Determine previous period of matching span (or previous calendar month when full month is selected)
        LocalDate prevStart;
        LocalDate prevEnd;
        if (effectiveStart.getDayOfMonth() == 1
                && effectiveEnd.equals(effectiveStart.withDayOfMonth(effectiveStart.lengthOfMonth()))) {
            YearMonth prevMonth = YearMonth.from(effectiveStart).minusMonths(1);
            prevStart = prevMonth.atDay(1);
            prevEnd = prevMonth.atEndOfMonth();
        } else {
            long days = ChronoUnit.DAYS.between(effectiveStart, effectiveEnd) + 1;
            prevEnd = effectiveStart.minusDays(1);
            prevStart = prevEnd.minusDays(days - 1);
        }

        BigDecimal periodIncome = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                userId, TransactionType.INCOME, effectiveStart, effectiveEnd);
        BigDecimal periodExpenses = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                userId, TransactionType.EXPENSE, effectiveStart, effectiveEnd);

        BigDecimal prevIncome = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                userId, TransactionType.INCOME, prevStart, prevEnd);
        BigDecimal prevExpenses = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                userId, TransactionType.EXPENSE, prevStart, prevEnd);

        BigDecimal cumulativeIncomeUpToEnd = transactionRepository.sumAmountByUserAndTypeUpToDate(
                userId, TransactionType.INCOME, effectiveEnd);
        BigDecimal cumulativeExpensesUpToEnd = transactionRepository.sumAmountByUserAndTypeUpToDate(
                userId, TransactionType.EXPENSE, effectiveEnd);
        BigDecimal totalBalance = cumulativeIncomeUpToEnd.subtract(cumulativeExpensesUpToEnd);

        BigDecimal prevCumulativeIncome = transactionRepository.sumAmountByUserAndTypeUpToDate(
                userId, TransactionType.INCOME, prevEnd);
        BigDecimal prevCumulativeExpenses = transactionRepository.sumAmountByUserAndTypeUpToDate(
                userId, TransactionType.EXPENSE, prevEnd);
        BigDecimal prevBalance = prevCumulativeIncome.subtract(prevCumulativeExpenses);

        double savingsRate = computeSavingsRate(periodIncome, periodExpenses);
        double prevSavingsRate = computeSavingsRate(prevIncome, prevExpenses);

        KpiSummary kpis = KpiSummary.builder()
                .totalBalance(totalBalance)
                .balanceDeltaPct(computeDeltaPct(totalBalance, prevBalance))
                .monthlyIncome(periodIncome)
                .incomeDeltaPct(computeDeltaPct(periodIncome, prevIncome))
                .monthlyExpenses(periodExpenses)
                .expensesDeltaPct(computeDeltaPct(periodExpenses, prevExpenses))
                .savingsRate(roundOneDecimal(savingsRate))
                .savingsRateDeltaPct(roundOneDecimal(savingsRate - prevSavingsRate))
                .build();

        List<Transaction> periodTransactions = transactionRepository
                .findByUserIdAndDateBetweenOrderByDateAscIdAsc(userId, effectiveStart, effectiveEnd);

        List<CategoryBreakdownItem> categoryBreakdown = buildCategoryBreakdown(periodTransactions, periodExpenses);
        List<CashFlowPoint> cashFlowTrend = buildCashFlowTrend(periodTransactions, effectiveStart, effectiveEnd);
        List<BudgetHealthItem> budgetHealth = buildBudgetHealth(userId, periodTransactions);
        List<PaymentMethodBreakdownItem> paymentBreakdown = buildPaymentMethodBreakdown(periodTransactions);
        SharedExpenseSummary sharedSummary = buildSharedSummary(periodTransactions);

        List<TransactionResponse> recentTransactions = transactionRepository
                .findByUserIdOrderByDateDescIdDesc(userId, PageRequest.of(0, 6))
                .stream()
                .map(TransactionService::toResponse)
                .toList();

        return DashboardResponse.builder()
                .kpis(kpis)
                .categoryBreakdown(categoryBreakdown)
                .cashFlowTrend(cashFlowTrend)
                .budgetHealth(budgetHealth)
                .recentTransactions(recentTransactions)
                .paymentMethodBreakdown(paymentBreakdown)
                .sharedSummary(sharedSummary)
                .build();
    }

    private List<CategoryBreakdownItem> buildCategoryBreakdown(
            List<Transaction> transactions,
            BigDecimal totalExpenses
    ) {
        Map<Long, List<Transaction>> grouped = transactions.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(tx -> tx.getCategory().getId()));

        List<CategoryBreakdownItem> items = new ArrayList<>();
        for (List<Transaction> txs : grouped.values()) {
            Category cat = txs.get(0).getCategory();
            BigDecimal sum = txs.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            double pct = totalExpenses.compareTo(BigDecimal.ZERO) > 0
                    ? sum.multiply(BigDecimal.valueOf(100))
                        .divide(totalExpenses, 1, RoundingMode.HALF_UP)
                        .doubleValue()
                    : 0.0;
            items.add(CategoryBreakdownItem.builder()
                    .categoryId(cat.getId())
                    .name(cat.getName())
                    .color(cat.getColor())
                    .icon(cat.getIcon())
                    .amount(sum)
                    .percentage(pct)
                    .build());
        }

        items.sort(Comparator.comparing(CategoryBreakdownItem::getAmount).reversed());
        return items;
    }

    private List<CashFlowPoint> buildCashFlowTrend(
            List<Transaction> transactions,
            LocalDate startDate,
            LocalDate endDate
    ) {
        long spanDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        if (spanDays <= 45) {
            Map<LocalDate, BigDecimal> incomeByDay = new LinkedHashMap<>();
            Map<LocalDate, BigDecimal> expenseByDay = new LinkedHashMap<>();
            for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
                incomeByDay.put(d, BigDecimal.ZERO);
                expenseByDay.put(d, BigDecimal.ZERO);
            }
            for (Transaction tx : transactions) {
                if (tx.getType() == TransactionType.INCOME) {
                    incomeByDay.merge(tx.getDate(), tx.getAmount(), BigDecimal::add);
                } else {
                    expenseByDay.merge(tx.getDate(), tx.getAmount(), BigDecimal::add);
                }
            }
            List<CashFlowPoint> points = new ArrayList<>();
            for (LocalDate d : incomeByDay.keySet()) {
                points.add(CashFlowPoint.builder()
                        .label(d.format(DAY_FORMAT))
                        .income(incomeByDay.get(d))
                        .expenses(expenseByDay.get(d))
                        .build());
            }
            return points;
        }

        // Multi-month range: aggregate by month
        Map<YearMonth, BigDecimal> incomeByMonth = new LinkedHashMap<>();
        Map<YearMonth, BigDecimal> expenseByMonth = new LinkedHashMap<>();
        YearMonth startYm = YearMonth.from(startDate);
        YearMonth endYm = YearMonth.from(endDate);
        for (YearMonth ym = startYm; !ym.isAfter(endYm); ym = ym.plusMonths(1)) {
            incomeByMonth.put(ym, BigDecimal.ZERO);
            expenseByMonth.put(ym, BigDecimal.ZERO);
        }
        for (Transaction tx : transactions) {
            YearMonth ym = YearMonth.from(tx.getDate());
            if (tx.getType() == TransactionType.INCOME) {
                incomeByMonth.merge(ym, tx.getAmount(), BigDecimal::add);
            } else {
                expenseByMonth.merge(ym, tx.getAmount(), BigDecimal::add);
            }
        }
        List<CashFlowPoint> points = new ArrayList<>();
        for (YearMonth ym : incomeByMonth.keySet()) {
            points.add(CashFlowPoint.builder()
                    .label(ym.format(MONTH_FORMAT))
                    .income(incomeByMonth.get(ym))
                    .expenses(expenseByMonth.get(ym))
                    .build());
        }
        return points;
    }

    private List<BudgetHealthItem> buildBudgetHealth(Long userId, List<Transaction> transactions) {
        List<Category> categories = categoryRepository.findByUserIdOrderByTypeAscNameAsc(userId);
        Map<Long, BigDecimal> spentByCat = transactions.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        tx -> tx.getCategory().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<BudgetHealthItem> items = new ArrayList<>();
        for (Category cat : categories) {
            if (cat.getType() != TransactionType.EXPENSE
                    || cat.getMonthlyBudget() == null
                    || cat.getMonthlyBudget().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            BigDecimal spent = spentByCat.getOrDefault(cat.getId(), BigDecimal.ZERO);
            double utilization = spent.multiply(BigDecimal.valueOf(100))
                    .divide(cat.getMonthlyBudget(), 1, RoundingMode.HALF_UP)
                    .doubleValue();
            String status = utilization >= 100.0 ? "EXCEEDED" : (utilization >= 80.0 ? "WARNING" : "HEALTHY");
            items.add(BudgetHealthItem.builder()
                    .categoryId(cat.getId())
                    .categoryName(cat.getName())
                    .color(cat.getColor())
                    .icon(cat.getIcon())
                    .spent(spent)
                    .limit(cat.getMonthlyBudget())
                    .utilizationPercent(utilization)
                    .status(status)
                    .build());
        }

        items.sort(Comparator.comparingDouble(BudgetHealthItem::getUtilizationPercent).reversed());
        return items;
    }

    private List<PaymentMethodBreakdownItem> buildPaymentMethodBreakdown(List<Transaction> transactions) {
        List<Transaction> expenses = transactions.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .toList();
        BigDecimal total = expenses.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<PaymentMethod, BigDecimal> sumByMethod = new EnumMap<>(PaymentMethod.class);
        Map<PaymentMethod, Long> countByMethod = new EnumMap<>(PaymentMethod.class);
        for (PaymentMethod pm : PaymentMethod.values()) {
            sumByMethod.put(pm, BigDecimal.ZERO);
            countByMethod.put(pm, 0L);
        }
        for (Transaction tx : expenses) {
            sumByMethod.merge(tx.getPaymentMethod(), tx.getAmount(), BigDecimal::add);
            countByMethod.merge(tx.getPaymentMethod(), 1L, Long::sum);
        }

        List<PaymentMethodBreakdownItem> items = new ArrayList<>();
        for (PaymentMethod pm : PaymentMethod.values()) {
            BigDecimal sum = sumByMethod.get(pm);
            double pct = total.compareTo(BigDecimal.ZERO) > 0
                    ? sum.multiply(BigDecimal.valueOf(100))
                        .divide(total, 1, RoundingMode.HALF_UP)
                        .doubleValue()
                    : 0.0;
            String label = switch (pm) {
                case CARD -> "Card";
                case CASH -> "Cash";
                case UPI_BANK -> "UPI / Bank";
            };
            items.add(PaymentMethodBreakdownItem.builder()
                    .paymentMethod(pm.name())
                    .label(label)
                    .total(sum)
                    .count(countByMethod.get(pm))
                    .percentage(pct)
                    .build());
        }
        return items;
    }

    private SharedExpenseSummary buildSharedSummary(List<Transaction> transactions) {
        List<Transaction> shared = transactions.stream()
                .filter(tx -> tx.getSplitWith() != null && !tx.getSplitWith().isBlank())
                .toList();
        BigDecimal sharedTotal = shared.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Transaction> recurring = transactions.stream()
                .filter(tx -> tx.isRecurring() && tx.getType() == TransactionType.EXPENSE)
                .toList();
        BigDecimal recurringTotal = recurring.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SharedExpenseSummary.builder()
                .totalSharedAmount(sharedTotal)
                .sharedTransactionCount(shared.size())
                .recurringMonthlyTotal(recurringTotal)
                .recurringCount(recurring.size())
                .build();
    }

    private double computeSavingsRate(BigDecimal income, BigDecimal expenses) {
        if (income.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }
        return income.subtract(expenses)
                .multiply(BigDecimal.valueOf(100))
                .divide(income, 1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private double computeDeltaPct(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous.abs(), 1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private double roundOneDecimal(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
