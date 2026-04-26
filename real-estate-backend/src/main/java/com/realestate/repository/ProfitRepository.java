package com.realestate.repository;

import com.realestate.entity.Profit;
import com.realestate.enums.IncomeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProfitRepository extends JpaRepository<Profit, Long> {

    Optional<Profit> findByDealId(Long dealId);
    boolean existsByDealId(Long dealId);

    List<Profit> findByPropertyId(Long propertyId);
    List<Profit> findByTransactionDateBetween(LocalDate start, LocalDate end);
    List<Profit> findByIncomeType(IncomeType incomeType);

    @Query("SELECT COALESCE(SUM(p.netProfit), 0) FROM Profit p")
    BigDecimal sumTotalNetProfit();

    @Query("SELECT COALESCE(SUM(p.commissionAmount), 0) FROM Profit p")
    BigDecimal sumTotalCommission();

    @Query("SELECT COALESCE(SUM(p.totalExpenses), 0) FROM Profit p")
    BigDecimal sumTotalExpenses();

    @Query("SELECT COALESCE(SUM(p.salePrice), 0) FROM Profit p")
    BigDecimal sumTotalSaleValue();

    @Query("SELECT COALESCE(AVG(p.profitMargin), 0) FROM Profit p")
    BigDecimal avgProfitMargin();

    @Query("SELECT COALESCE(SUM(p.netProfit), 0) FROM Profit p WHERE p.transactionDate BETWEEN :start AND :end")
    BigDecimal sumNetProfitBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(p.commissionAmount), 0) FROM Profit p WHERE p.incomeType = :type")
    BigDecimal sumCommissionByIncomeType(@Param("type") IncomeType type);
}
