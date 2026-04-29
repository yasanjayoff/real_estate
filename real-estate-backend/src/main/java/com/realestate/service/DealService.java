package com.realestate.service;

import com.realestate.dto.DealDto;
import com.realestate.entity.Deal;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import com.realestate.enums.DealStatus;
import com.realestate.enums.PropertyStatus;
import com.realestate.exception.BadRequestException;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.DealRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DealService {

    private final DealRepository dealRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PropertyService propertyService;
    private final UserService userService;

    public List<DealDto.Response> getAllDeals() {
        return dealRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public DealDto.Response getDealById(Long id) {
        return toResponse(findById(id));
    }

    public List<DealDto.Response> getDealsByBuyer(Long buyerId) {
        return dealRepository.findByBuyerId(buyerId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<DealDto.Response> getDealsBySeller(Long sellerId) {
        return dealRepository.findBySellerId(sellerId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<DealDto.Response> getDealsByStatus(DealStatus status) {
        return dealRepository.findByStatus(status).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<DealDto.Response> getDealsByProperty(Long propertyId) {
        return dealRepository.findByPropertyId(propertyId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public DealDto.Response createDeal(DealDto.Request request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", request.getPropertyId()));
        User buyer = userRepository.findById(request.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer", request.getBuyerId()));

        Deal deal = Deal.builder()
                .property(property)
                .buyer(buyer)
                .offerPrice(request.getOfferPrice())
                .status(request.getStatus() != null ? request.getStatus() : DealStatus.PENDING)
                .notes(request.getNotes())
                .closedDate(request.getClosedDate())
                .build();

        // Resolve seller: explicit sellerId or fall back to property owner
        if (request.getSellerId() != null) {
            User seller = userRepository.findById(request.getSellerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Seller", request.getSellerId()));
            deal.setSeller(seller);
        } else if (property.getOwner() != null) {
            deal.setSeller(property.getOwner());
        }

        if (request.getAgentId() != null) {
            User agent = userRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Agent", request.getAgentId()));
            deal.setAgent(agent);
        }

        // Update property status to UNDER_NEGOTIATION
        property.setStatus(PropertyStatus.UNDER_NEGOTIATION);
        propertyRepository.save(property);

        return toResponse(dealRepository.save(deal));
    }

    public DealDto.Response updateDeal(Long id, DealDto.Request request) {
        Deal deal = findById(id);

        deal.setOfferPrice(request.getOfferPrice());
        if (request.getStatus() != null) deal.setStatus(request.getStatus());
        deal.setNotes(request.getNotes());
        deal.setClosedDate(request.getClosedDate());

        // If deal is CLOSED, update property to SOLD
        if (DealStatus.CLOSED.equals(request.getStatus())) {
            deal.getProperty().setStatus(PropertyStatus.SOLD);
            propertyRepository.save(deal.getProperty());
        }
        // If deal is CANCELLED, revert property to AVAILABLE
        if (DealStatus.CANCELLED.equals(request.getStatus())) {
            deal.getProperty().setStatus(PropertyStatus.AVAILABLE);
            propertyRepository.save(deal.getProperty());
        }

        return toResponse(dealRepository.save(deal));
    }

    public DealDto.Response replyToDeal(Long id, DealDto.ReplyRequest request) {
        Deal deal = findById(id);
        deal.setAdminReply(request.getReplyText());
        deal.setRepliedAt(java.time.LocalDateTime.now());
        if (request.getStatus() != null) {
            deal.setStatus(request.getStatus());
            if (com.realestate.enums.DealStatus.CLOSED.equals(request.getStatus())) {
                deal.getProperty().setStatus(com.realestate.enums.PropertyStatus.SOLD);
                propertyRepository.save(deal.getProperty());
            }
            if (com.realestate.enums.DealStatus.CANCELLED.equals(request.getStatus())) {
                deal.getProperty().setStatus(com.realestate.enums.PropertyStatus.AVAILABLE);
                propertyRepository.save(deal.getProperty());
            }
        }
        return toResponse(dealRepository.save(deal));
    }

    public void deleteDeal(Long id) {
        Deal deal = findById(id);
        // Revert property status if deleting an active deal
        if (!DealStatus.CLOSED.equals(deal.getStatus()) && !DealStatus.CANCELLED.equals(deal.getStatus())) {
            deal.getProperty().setStatus(PropertyStatus.AVAILABLE);
            propertyRepository.save(deal.getProperty());
        }
        dealRepository.deleteById(id);
    }

    private Deal findById(Long id) {
        return dealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", id));
    }

    public DealDto.Response toResponse(Deal deal) {
        DealDto.Response response = new DealDto.Response();
        response.setId(deal.getId());
        response.setOfferPrice(deal.getOfferPrice());
        response.setStatus(deal.getStatus());
        response.setNotes(deal.getNotes());
        response.setClosedDate(deal.getClosedDate());
        response.setAdminReply(deal.getAdminReply());
        response.setRepliedAt(deal.getRepliedAt());
        response.setCreatedAt(deal.getCreatedAt());
        response.setUpdatedAt(deal.getUpdatedAt());
        if (deal.getProperty() != null) response.setProperty(propertyService.toResponse(deal.getProperty()));
        if (deal.getBuyer() != null) response.setBuyer(userService.toResponse(deal.getBuyer()));
        if (deal.getSeller() != null) response.setSeller(userService.toResponse(deal.getSeller()));
        if (deal.getAgent() != null) response.setAgent(userService.toResponse(deal.getAgent()));
        return response;
    }
}
