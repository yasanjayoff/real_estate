package com.realestate.repository;

import com.realestate.entity.Deal;
import com.realestate.enums.DealStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealRepository extends JpaRepository<Deal, Long> {
    List<Deal> findByStatus(DealStatus status);
    List<Deal> findByBuyerId(Long buyerId);
    List<Deal> findBySellerId(Long sellerId);
    List<Deal> findByAgentId(Long agentId);
    List<Deal> findByPropertyId(Long propertyId);
    boolean existsByPropertyIdAndStatusIn(Long propertyId, List<DealStatus> statuses);
}
