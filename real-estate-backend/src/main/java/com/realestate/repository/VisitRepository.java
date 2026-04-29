package com.realestate.repository;

import com.realestate.entity.Visit;
import com.realestate.enums.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByStatus(VisitStatus status);
    List<Visit> findByBuyerId(Long buyerId);
    List<Visit> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<Visit> findByAgentId(Long agentId);
    List<Visit> findByPropertyId(Long propertyId);
    List<Visit> findByVisitDateBetween(LocalDate start, LocalDate end);
    List<Visit> findByVisitDateGreaterThanEqualOrderByVisitDateAsc(LocalDate date);
}
