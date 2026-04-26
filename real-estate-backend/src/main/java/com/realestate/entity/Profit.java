package com.realestate.entity;

import com.realestate.enums.CommissionType;
import com.realestate.enums.IncomeType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "profits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to deal (optional — profit can also be recorded directly against a property)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deal_id")
    private Deal deal;

    // Direct property link (for reports — always set)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // ── Sale & Commission ──────────────────────────────────────────────────────
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommissionType commissionType;  // PERCENTAGE or FIXED

    // For PERCENTAGE: e.g. 2.5 (means 2.5%)
    // For FIXED: not used for calculation but stored for reference
    @Column(precision = 10, scale = 4)
    private BigDecimal commissionRate;

    // For FIXED: actual fixed amount
    // For PERCENTAGE: computed from salePrice × rate / 100
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal commissionAmount;

    // ── Income classification ──────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncomeType incomeType;

    // ── Expenses breakdown ─────────────────────────────────────────────────────
    @Column(precision = 15, scale = 2)
    private BigDecimal advertisingExpense;

    @Column(precision = 15, scale = 2)
    private BigDecimal legalExpense;

    @Column(precision = 15, scale = 2)
    private BigDecimal maintenanceExpense;

    @Column(precision = 15, scale = 2)
    private BigDecimal otherExpense;

    // Total expenses (sum of all above)
    @Column(precision = 15, scale = 2)
    private BigDecimal totalExpenses;

    // ── Final figures ──────────────────────────────────────────────────────────
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal netProfit;   // commissionAmount − totalExpenses

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal profitMargin;  // netProfit / salePrice × 100

    // ── Meta ───────────────────────────────────────────────────────────────────
    private LocalDate transactionDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
