package com.realestate.dto;

import com.realestate.enums.CommissionType;
import com.realestate.enums.IncomeType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProfitDto {

    @Data
    public static class Request {
        @NotNull private Long propertyId;          // required — select property first
        private Long dealId;                       // optional — link to a specific deal

        @NotNull private BigDecimal salePrice;
        @NotNull private CommissionType commissionType;   // PERCENTAGE or FIXED
        private BigDecimal commissionRate;                // used when PERCENTAGE (e.g. 2.5)
        private BigDecimal fixedCommissionAmount;         // used when FIXED (e.g. 250000)

        @NotNull private IncomeType incomeType;

        // Expense breakdown (all optional)
        private BigDecimal advertisingExpense;
        private BigDecimal legalExpense;
        private BigDecimal maintenanceExpense;
        private BigDecimal otherExpense;

        private LocalDate transactionDate;
        private String notes;
    }

    @Data
    public static class Response {
        private Long id;
        private PropertyDto.Response property;
        private DealDto.Response deal;

        private BigDecimal salePrice;
        private CommissionType commissionType;
        private BigDecimal commissionRate;
        private BigDecimal commissionAmount;
        private IncomeType incomeType;

        // Expenses
        private BigDecimal advertisingExpense;
        private BigDecimal legalExpense;
        private BigDecimal maintenanceExpense;
        private BigDecimal otherExpense;
        private BigDecimal totalExpenses;

        // Results
        private BigDecimal netProfit;
        private BigDecimal profitMargin;

        private LocalDate transactionDate;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class Summary {
        private BigDecimal totalSaleValue;
        private BigDecimal totalCommission;
        private BigDecimal totalExpenses;
        private BigDecimal totalNetProfit;
        private BigDecimal avgProfitMargin;
        private Long totalRecords;
        // Per income type
        private BigDecimal commissionIncome;
        private BigDecimal managementFeeIncome;
        private BigDecimal consultationFeeIncome;
        private BigDecimal referralFeeIncome;
        private BigDecimal otherIncome;
    }
}
