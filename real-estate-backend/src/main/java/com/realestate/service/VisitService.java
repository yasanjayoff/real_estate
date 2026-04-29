package com.realestate.service;

import com.realestate.dto.VisitDto;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import com.realestate.entity.Visit;
import com.realestate.enums.VisitStatus;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import com.realestate.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VisitService {

    private final VisitRepository visitRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PropertyService propertyService;
    private final UserService userService;

    public List<VisitDto.Response> getAllVisits() {
        return visitRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public VisitDto.Response getVisitById(Long id) {
        return toResponse(findById(id));
    }

    public List<VisitDto.Response> getUpcomingVisits() {
        return visitRepository.findByVisitDateGreaterThanEqualOrderByVisitDateAsc(LocalDate.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<VisitDto.Response> getVisitsByBuyer(Long buyerId) {
        return visitRepository.findByBuyerId(buyerId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<VisitDto.Response> getVisitsByProperty(Long propertyId) {
        return visitRepository.findByPropertyId(propertyId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public VisitDto.Response createVisit(VisitDto.Request request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", request.getPropertyId()));
        User buyer = userRepository.findById(request.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer", request.getBuyerId()));

        Visit visit = Visit.builder()
                .property(property)
                .buyer(buyer)
                .visitDate(request.getVisitDate())
                .visitTime(request.getVisitTime())
                .status(VisitStatus.PENDING)
                .notes(request.getNotes())
                .build();

        if (request.getAgentId() != null) {
            User agent = userRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Agent", request.getAgentId()));
            visit.setAgent(agent);
        }

        return toResponse(visitRepository.save(visit));
    }

    public VisitDto.Response updateVisit(Long id, VisitDto.Request request) {
        Visit visit = findById(id);
        visit.setVisitDate(request.getVisitDate());
        visit.setVisitTime(request.getVisitTime());
        if (request.getStatus() != null) visit.setStatus(request.getStatus());
        visit.setNotes(request.getNotes());

        if (request.getAgentId() != null) {
            User agent = userRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Agent", request.getAgentId()));
            visit.setAgent(agent);
        }

        return toResponse(visitRepository.save(visit));
    }

    public VisitDto.Response approveVisit(Long id, VisitDto.ApproveRejectRequest request) {
        Visit visit = findById(id);
        visit.setStatus(VisitStatus.APPROVED);
        if (request != null && request.getAdminNote() != null) {
            visit.setAdminNote(request.getAdminNote());
        }
        return toResponse(visitRepository.save(visit));
    }

    public VisitDto.Response rejectVisit(Long id, VisitDto.ApproveRejectRequest request) {
        Visit visit = findById(id);
        visit.setStatus(VisitStatus.REJECTED);
        if (request != null && request.getAdminNote() != null) {
            visit.setAdminNote(request.getAdminNote());
        }
        return toResponse(visitRepository.save(visit));
    }

        public void deleteVisit(Long id) {
        if (!visitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Visit", id);
        }
        visitRepository.deleteById(id);
    }

    private Visit findById(Long id) {
        return visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit", id));
    }

    public VisitDto.Response toResponse(Visit visit) {
        VisitDto.Response response = new VisitDto.Response();
        response.setId(visit.getId());
        response.setVisitDate(visit.getVisitDate());
        response.setVisitTime(visit.getVisitTime());
        response.setStatus(visit.getStatus());
        response.setNotes(visit.getNotes());
        response.setAdminNote(visit.getAdminNote());
        response.setCreatedAt(visit.getCreatedAt());
        response.setUpdatedAt(visit.getUpdatedAt());
        if (visit.getProperty() != null) response.setProperty(propertyService.toResponse(visit.getProperty()));
        if (visit.getBuyer() != null) response.setBuyer(userService.toResponse(visit.getBuyer()));
        if (visit.getAgent() != null) response.setAgent(userService.toResponse(visit.getAgent()));
        return response;
    }
}
