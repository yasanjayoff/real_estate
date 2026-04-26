package com.realestate.service;

import com.realestate.dto.ProfitDto;
import com.realestate.entity.Deal;
import com.realestate.entity.Profit;
import com.realestate.entity.Property;
import com.realestate.enums.CommissionType;
import com.realestate.enums.IncomeType;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.DealRepository;
import com.realestate.repository.ProfitRepository;
import com.realestate.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfitService {

    private final ProfitRepository profitRepository;
    private final DealRepository dealRepository;
    private final PropertyRepository propertyRepository;
    private final DealService dealService;
    private final PropertyService propertyService;

    public List<ProfitDto.Response> getAllProfits() {
        return profitRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public ProfitDto.Response getProfitById(Long id) {
        return toResponse(findById(id));
    }

    public ProfitDto.Response getProfitByDeal(Long dealId) {
        Profit profit = profitRepository.findByDealId(dealId)
                .orElseThrow(() -> new ResourceNotFoundException("Profit record for deal", dealId));
        return toResponse(profit);
    }

    public List<ProfitDto.Response> getProfitsByProperty(Long propertyId) {
        return profitRepository.findByPropertyId(propertyId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProfitDto.Summary getSummary() {
        ProfitDto.Summary s = new ProfitDto.Summary();
        s.setTotalSaleValue(orZero(profitRepository.sumTotalSaleValue()));
        s.setTotalCommission(orZero(profitRepository.sumTotalCommission()));
        s.setTotalExpenses(orZero(profitRepository.sumTotalExpenses()));
        s.setTotalNetProfit(orZero(profitRepository.sumTotalNetProfit()));
        s.setAvgProfitMargin(orZero(profitRepository.avgProfitMargin()));
        s.setTotalRecords(profitRepository.count());
        // Per income type breakdown
        s.setCommissionIncome(orZero(profitRepository.sumCommissionByIncomeType(IncomeType.COMMISSION)));
        s.setManagementFeeIncome(orZero(profitRepository.sumCommissionByIncomeType(IncomeType.MANAGEMENT_FEE)));
        s.setConsultationFeeIncome(orZero(profitRepository.sumCommissionByIncomeType(IncomeType.CONSULTATION_FEE)));
        s.setReferralFeeIncome(orZero(profitRepository.sumCommissionByIncomeType(IncomeType.REFERRAL_FEE)));
        s.setOtherIncome(orZero(profitRepository.sumCommissionByIncomeType(IncomeType.OTHER)));
        return s;
    }

    public ProfitDto.Response createProfit(ProfitDto.Request req) {
        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", req.getPropertyId()));

        Deal deal = null;
        if (req.getDealId() != null) {
            deal = dealRepository.findById(req.getDealId())
                    .orElseThrow(() -> new ResourceNotFoundException("Deal", req.getDealId()));
        }

        Profit profit = buildProfit(req, property, deal, new Profit());
        return toResponse(profitRepository.save(profit));
    }

    public ProfitDto.Response updateProfit(Long id, ProfitDto.Request req) {
        Profit profit = findById(id);

        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", req.getPropertyId()));

        Deal deal = null;
        if (req.getDealId() != null) {
            deal = dealRepository.findById(req.getDealId())
                    .orElseThrow(() -> new ResourceNotFoundException("Deal", req.getDealId()));
        }

        buildProfit(req, property, deal, profit);
        return toResponse(profitRepository.save(profit));
    }

    public void deleteProfit(Long id) {
        if (!profitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Profit", id);
        }
        profitRepository.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Profit buildProfit(ProfitDto.Request req, Property property, Deal deal, Profit profit) {
        BigDecimal salePrice = req.getSalePrice();

        // Calculate commission based on type
        BigDecimal commissionAmount;
        BigDecimal commissionRate;

        if (req.getCommissionType() == CommissionType.PERCENTAGE) {
            commissionRate = req.getCommissionRate() != null ? req.getCommissionRate() : BigDecimal.ZERO;
            commissionAmount = salePrice.multiply(commissionRate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            // FIXED
            commissionAmount = req.getFixedCommissionAmount() != null ? req.getFixedCommissionAmount() : BigDecimal.ZERO;
            // Store implied rate for reporting reference
            commissionRate = salePrice.compareTo(BigDecimal.ZERO) > 0
                    ? commissionAmount.multiply(BigDecimal.valueOf(100))
                          .divide(salePrice, 4, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
        }

        // Expense breakdown
        BigDecimal adv  = orZero(req.getAdvertisingExpense());
        BigDecimal leg  = orZero(req.getLegalExpense());
        BigDecimal mnt  = orZero(req.getMaintenanceExpense());
        BigDecimal oth  = orZero(req.getOtherExpense());
        BigDecimal totalExpenses = adv.add(leg).add(mnt).add(oth);

        BigDecimal netProfit = commissionAmount.subtract(totalExpenses);

        // Profit margin = netProfit / salePrice × 100
        BigDecimal profitMargin = salePrice.compareTo(BigDecimal.ZERO) > 0
                ? netProfit.multiply(BigDecimal.valueOf(100)).divide(salePrice, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        profit.setProperty(property);
        profit.setDeal(deal);
        profit.setSalePrice(salePrice);
        profit.setCommissionType(req.getCommissionType());
        profit.setCommissionRate(commissionRate);
        profit.setCommissionAmount(commissionAmount);
        profit.setIncomeType(req.getIncomeType() != null ? req.getIncomeType() : IncomeType.COMMISSION);
        profit.setAdvertisingExpense(adv);
        profit.setLegalExpense(leg);
        profit.setMaintenanceExpense(mnt);
        profit.setOtherExpense(oth);
        profit.setTotalExpenses(totalExpenses);
        profit.setNetProfit(netProfit);
        profit.setProfitMargin(profitMargin);
        profit.setTransactionDate(req.getTransactionDate() != null ? req.getTransactionDate() : LocalDate.now());
        profit.setNotes(req.getNotes());

        return profit;
    }

    private Profit findById(Long id) {
        return profitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profit", id));
    }

    private BigDecimal orZero(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    public ProfitDto.Response toResponse(Profit p) {
        ProfitDto.Response r = new ProfitDto.Response();
        r.setId(p.getId());
        r.setSalePrice(p.getSalePrice());
        r.setCommissionType(p.getCommissionType());
        r.setCommissionRate(p.getCommissionRate());
        r.setCommissionAmount(p.getCommissionAmount());
        r.setIncomeType(p.getIncomeType());
        r.setAdvertisingExpense(p.getAdvertisingExpense());
        r.setLegalExpense(p.getLegalExpense());
        r.setMaintenanceExpense(p.getMaintenanceExpense());
        r.setOtherExpense(p.getOtherExpense());
        r.setTotalExpenses(p.getTotalExpenses());
        r.setNetProfit(p.getNetProfit());
        r.setProfitMargin(p.getProfitMargin());
        r.setTransactionDate(p.getTransactionDate());
        r.setNotes(p.getNotes());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        if (p.getProperty() != null) r.setProperty(propertyService.toResponse(p.getProperty()));
        if (p.getDeal() != null) r.setDeal(dealService.toResponse(p.getDeal()));
        return r;
    }
}
