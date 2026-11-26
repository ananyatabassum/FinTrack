package com.fintrack.expensetracker.service;

import com.fintrack.expensetracker.entity.*;
import com.fintrack.expensetracker.repository.TransactionRepository;
import com.fintrack.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoDataService {

    public static final String DEMO_EMAIL = "demo@fintrack.app";

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryService categoryService;

    @Transactional
    public synchronized User ensureDemoUserSeeded() {
        return userRepository.findByEmailIgnoreCase(DEMO_EMAIL).orElseGet(() -> {
            User demoUser = userRepository.save(User.builder()
                    .fullName("Alex Rivera")
                    .email(DEMO_EMAIL)
                    .password(passwordEncoder.encode("Demo@1234"))
                    .role("USER")
                    .build());

            List<Category> categories = categoryService.seedDefaultCategoriesForUser(demoUser);
            Map<String, Category> catMap = categories.stream()
                    .collect(Collectors.toMap(Category::getName, Function.identity()));

            LocalDate today = LocalDate.now();
            YearMonth currYm = YearMonth.from(today);
            YearMonth prevYm = currYm.minusMonths(1);

            List<Transaction> seededTransactions = List.of(
                    // === CURRENT MONTH (19 transactions) ===
                    tx(demoUser, catMap.get("Salary"), "TechCorp Monthly Payroll", "5400.00", TransactionType.INCOME, PaymentMethod.UPI_BANK, currDate(today, 1), "Direct deposit salary", true, null),
                    tx(demoUser, catMap.get("Freelance"), "Stripe Design System Audit", "1450.00", TransactionType.INCOME, PaymentMethod.UPI_BANK, currDate(today, 12), "Q4 client consulting milestone", false, null),

                    tx(demoUser, catMap.get("Housing & Rent"), "Skyline Lofts Rent", "1450.00", TransactionType.EXPENSE, PaymentMethod.UPI_BANK, currDate(today, 2), "Monthly apartment lease (split 50/50)", true, "Maya Chen"),
                    tx(demoUser, catMap.get("Utilities"), "ConEdison Electric & Gas", "118.40", TransactionType.EXPENSE, PaymentMethod.UPI_BANK, currDate(today, 4), "Auto-pay utility bill", true, "Maya Chen"),
                    tx(demoUser, catMap.get("Utilities"), "Fiber Gigabit Internet", "69.99", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 5), "Monthly fiber plan", true, "Maya Chen"),
                    tx(demoUser, catMap.get("Subscriptions"), "Linear & Figma Pro", "44.00", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 3), "Design & product tools", true, null),
                    tx(demoUser, catMap.get("Subscriptions"), "Spotify Duo + iCloud+", "24.98", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 6), "Monthly digital bundle", true, null),
                    tx(demoUser, catMap.get("Subscriptions"), "AWS Personal Sandbox", "38.50", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 14), "Cloud hosting & RDS", true, null),

                    tx(demoUser, catMap.get("Food & Dining"), "Whole Foods Market", "164.80", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 3), "Weekly groceries & produce", false, "Maya Chen"),
                    tx(demoUser, catMap.get("Food & Dining"), "Blue Bottle Coffee", "18.50", TransactionType.EXPENSE, PaymentMethod.CASH, currDate(today, 7), "Morning pour-over & croissant", false, null),
                    tx(demoUser, catMap.get("Food & Dining"), "Osteria Mozza Dinner", "192.00", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 11), "Friday team & friends dinner", false, "Liam, Maya"),
                    tx(demoUser, catMap.get("Food & Dining"), "Trader Joe's Groceries", "118.25", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 16), "Pantry restock", false, null),
                    tx(demoUser, catMap.get("Food & Dining"), "Sweetgreen & Matcha", "64.45", TransactionType.EXPENSE, PaymentMethod.UPI_BANK, currDate(today, 20), "Weekday lunches", false, null),

                    tx(demoUser, catMap.get("Transport"), "Metro Transit Monthly Pass", "132.00", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 2), "Unlimited subway & rail", true, null),
                    tx(demoUser, catMap.get("Transport"), "Uber Airport & Late Rides", "84.60", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 15), "Client meeting commute", false, "Liam Patel"),

                    tx(demoUser, catMap.get("Entertainment"), "IMAX & Concert Tickets", "168.00", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 9), "Indie concert + cinema", false, "Maya Chen"),
                    tx(demoUser, catMap.get("Entertainment"), "Weekend Rooftop Jazz", "82.50", TransactionType.EXPENSE, PaymentMethod.CASH, currDate(today, 18), "Cover & drinks", false, null),

                    tx(demoUser, catMap.get("Shopping"), "Uniqlo & Running Gear", "238.90", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 13), "Winter jacket and socks", false, null),
                    tx(demoUser, catMap.get("Health"), "Equinox Fitness & Pharmacy", "165.00", TransactionType.EXPENSE, PaymentMethod.CARD, currDate(today, 8), "Gym membership + vitamins", true, null),

                    // === PREVIOUS MONTH (16 transactions -> total 35) ===
                    tx(demoUser, catMap.get("Salary"), "TechCorp Monthly Payroll", "5400.00", TransactionType.INCOME, PaymentMethod.UPI_BANK, prevDate(prevYm, 1), "Direct deposit salary", true, null),
                    tx(demoUser, catMap.get("Freelance"), "FinTech Landing Page UI", "950.00", TransactionType.INCOME, PaymentMethod.UPI_BANK, prevDate(prevYm, 18), "Design sprint payout", false, null),

                    tx(demoUser, catMap.get("Housing & Rent"), "Skyline Lofts Rent", "1450.00", TransactionType.EXPENSE, PaymentMethod.UPI_BANK, prevDate(prevYm, 2), "Monthly apartment lease", true, "Maya Chen"),
                    tx(demoUser, catMap.get("Utilities"), "ConEdison Electric & Gas", "104.20", TransactionType.EXPENSE, PaymentMethod.UPI_BANK, prevDate(prevYm, 4), "Auto-pay utility bill", true, "Maya Chen"),
                    tx(demoUser, catMap.get("Utilities"), "Fiber Gigabit Internet", "69.99", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 5), "Monthly fiber plan", true, "Maya Chen"),
                    tx(demoUser, catMap.get("Subscriptions"), "Linear & Figma Pro", "44.00", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 3), "Design & product tools", true, null),
                    tx(demoUser, catMap.get("Subscriptions"), "Spotify Duo + iCloud+", "24.98", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 6), "Monthly digital bundle", true, null),

                    tx(demoUser, catMap.get("Food & Dining"), "Whole Foods Market", "152.30", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 6), "Weekly groceries", false, "Maya Chen"),
                    tx(demoUser, catMap.get("Food & Dining"), "Ramen Nagi & Izakaya", "112.00", TransactionType.EXPENSE, PaymentMethod.CASH, prevDate(prevYm, 14), "Weekend dinner", false, "Liam Patel"),
                    tx(demoUser, catMap.get("Food & Dining"), "Trader Joe's Groceries", "134.10", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 22), "Weekly groceries", false, null),

                    tx(demoUser, catMap.get("Transport"), "Metro Transit Monthly Pass", "132.00", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 2), "Unlimited subway & rail", true, null),
                    tx(demoUser, catMap.get("Transport"), "Amtrak Weekend Trip", "118.00", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 19), "Round-trip ticket", false, null),

                    tx(demoUser, catMap.get("Entertainment"), "Museum & Jazz Club", "94.00", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 15), "Saturday outing", false, "Maya Chen"),
                    tx(demoUser, catMap.get("Health"), "Dental Checkup & Gym", "210.00", TransactionType.EXPENSE, PaymentMethod.UPI_BANK, prevDate(prevYm, 11), "Routine checkup + gym", false, null),
                    tx(demoUser, catMap.get("Shopping"), "Mechanical Keyboard Keycaps", "149.50", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 20), "Desk setup upgrade", false, null),
                    tx(demoUser, catMap.get("Shopping"), "Apple USB-C Hub & Cable", "89.00", TransactionType.EXPENSE, PaymentMethod.CARD, prevDate(prevYm, 25), "Travel accessories", false, null)
            );

            transactionRepository.saveAll(seededTransactions);
            log.info("Seeded demo user '{}', {} categories, and {} transactions",
                    DEMO_EMAIL, categories.size(), seededTransactions.size());
            return demoUser;
        });
    }

    private LocalDate currDate(LocalDate today, int desiredDay) {
        int clamped = Math.min(desiredDay, today.getDayOfMonth());
        return today.withDayOfMonth(Math.max(1, clamped));
    }

    private LocalDate prevDate(YearMonth prevYm, int desiredDay) {
        int clamped = Math.min(desiredDay, prevYm.lengthOfMonth());
        return prevYm.atDay(Math.max(1, clamped));
    }

    private Transaction tx(
            User user,
            Category category,
            String title,
            String amount,
            TransactionType type,
            PaymentMethod paymentMethod,
            LocalDate date,
            String notes,
            boolean recurring,
            String splitWith
    ) {
        return Transaction.builder()
                .user(user)
                .category(category)
                .title(title)
                .amount(new BigDecimal(amount))
                .type(type)
                .paymentMethod(paymentMethod)
                .date(date)
                .notes(notes)
                .isRecurring(recurring)
                .splitWith(splitWith)
                .build();
    }
}
