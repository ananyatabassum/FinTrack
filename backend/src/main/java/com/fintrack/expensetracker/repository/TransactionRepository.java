package com.fintrack.expensetracker.repository;

import com.fintrack.expensetracker.entity.Transaction;
import com.fintrack.expensetracker.entity.TransactionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    @EntityGraph(attributePaths = {"category"})
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findByUserIdOrderByDateDescIdDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findByUserIdAndDateBetweenOrderByDateAscIdAsc(Long userId, LocalDate startDate, LocalDate endDate);

    @EntityGraph(attributePaths = {"category"})
    List<Transaction> findByUserIdOrderByDateDescIdDesc(Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndTypeAndDateBetween(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumAmountByUserAndType(@Param("userId") Long userId, @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.date <= :endDate")
    BigDecimal sumAmountByUserAndTypeUpToDate(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("endDate") LocalDate endDate
    );

    boolean existsByCategoryId(Long categoryId);

    long countByUserIdAndCategoryIdAndDateBetween(Long userId, Long categoryId, LocalDate startDate, LocalDate endDate);
}
