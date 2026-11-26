package com.fintrack.expensetracker.repository;

import com.fintrack.expensetracker.entity.PaymentMethod;
import com.fintrack.expensetracker.entity.Transaction;
import com.fintrack.expensetracker.entity.TransactionType;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    public static Specification<Transaction> withFilters(
            Long userId,
            String keyword,
            TransactionType type,
            Long categoryId,
            PaymentMethod paymentMethod,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return (root, query, cb) -> {
            if (Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("category", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate notesMatch = cb.like(cb.lower(cb.coalesce(root.get("notes"), "")), pattern);
                Predicate splitMatch = cb.like(cb.lower(cb.coalesce(root.get("splitWith"), "")), pattern);
                Predicate categoryMatch = cb.like(cb.lower(root.get("category").get("name")), pattern);
                predicates.add(cb.or(titleMatch, notesMatch, splitMatch, categoryMatch));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (paymentMethod != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), paymentMethod));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
