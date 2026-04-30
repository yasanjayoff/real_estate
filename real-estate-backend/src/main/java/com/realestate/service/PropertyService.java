package com.realestate.service;

import com.realestate.dto.PropertyDto;
import com.realestate.dto.PropertyImageDto;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import com.realestate.enums.PropertyStatus;
import com.realestate.enums.PropertyType;
import com.realestate.enums.SlotStatus;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.ApartmentUnitRepository;
import com.realestate.repository.LandBlockRepository;
import com.realestate.repository.PropertyImageRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PropertyImageRepository imageRepository;
    private final LandBlockRepository landBlockRepository;
    private final ApartmentUnitRepository apartmentUnitRepository;
    private final ModelMapper modelMapper;

    public List<PropertyDto.Response> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PropertyDto.Response getPropertyById(Long id) {
        return toResponse(findById(id));
    }

    public List<PropertyDto.Response> getPropertiesWithFilters(
            PropertyStatus status, PropertyType type, String city,
            BigDecimal minPrice, BigDecimal maxPrice) {
        return propertyRepository.findWithFilters(status, type, city, minPrice, maxPrice)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PropertyDto.Response> getPropertiesByOwner(Long ownerId) {
        return propertyRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public PropertyDto.Response createProperty(PropertyDto.Request req) {
        User owner = userRepository.findById(req.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner user", req.getOwnerId()));

        Property property = Property.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .propertyType(req.getPropertyType())
                .address(req.getAddress())
                .city(req.getCity())
                .district(req.getDistrict())
                .price(req.getPrice())
                .sizeInSqft(req.getSizeInSqft())
                .status(req.getStatus() != null ? req.getStatus() : PropertyStatus.AVAILABLE)
                .owner(owner)
                // LAND
                .totalBlocks(req.getTotalBlocks())
                .pricePerBlock(req.getPricePerBlock())
                // APARTMENT
                .totalFloors(req.getTotalFloors())
                .unitsPerFloor(req.getUnitsPerFloor())
                .pricePerUnit(req.getPricePerUnit())
                .yearBuilt(req.getYearBuilt())
                .hasParking(req.getHasParking())
                .hasGym(req.getHasGym())
                .hasPool(req.getHasPool())
                .build();

        return toResponse(propertyRepository.save(property));
    }

    public PropertyDto.Response updateProperty(Long id, PropertyDto.Request req) {
        Property property = findById(id);
        User owner = userRepository.findById(req.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner user", req.getOwnerId()));

        property.setTitle(req.getTitle());
        property.setDescription(req.getDescription());
        property.setPropertyType(req.getPropertyType());
        property.setAddress(req.getAddress());
        property.setCity(req.getCity());
        property.setDistrict(req.getDistrict());
        property.setPrice(req.getPrice());
        property.setSizeInSqft(req.getSizeInSqft());
        if (req.getStatus() != null) property.setStatus(req.getStatus());
        property.setOwner(owner);
        // LAND
        property.setTotalBlocks(req.getTotalBlocks());
        property.setPricePerBlock(req.getPricePerBlock());
        // APARTMENT
        property.setTotalFloors(req.getTotalFloors());
        property.setUnitsPerFloor(req.getUnitsPerFloor());
        property.setPricePerUnit(req.getPricePerUnit());
        property.setYearBuilt(req.getYearBuilt());
        property.setHasParking(req.getHasParking());
        property.setHasGym(req.getHasGym());
        property.setHasPool(req.getHasPool());

        return toResponse(propertyRepository.save(property));
    }

    public PropertyDto.Response updateStatus(Long id, PropertyStatus status) {
        Property property = findById(id);
        property.setStatus(status);
        return toResponse(propertyRepository.save(property));
    }

    public void deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Property", id);
        }
        propertyRepository.deleteById(id);
    }

    private Property findById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", id));
    }

    public PropertyDto.Response toResponse(Property p) {
        PropertyDto.Response r = new PropertyDto.Response();
        r.setId(p.getId());
        r.setTitle(p.getTitle());
        r.setDescription(p.getDescription());
        r.setPropertyType(p.getPropertyType());
        r.setAddress(p.getAddress());
        r.setCity(p.getCity());
        r.setDistrict(p.getDistrict());
        r.setPrice(p.getPrice());
        r.setSizeInSqft(p.getSizeInSqft());
        r.setStatus(p.getStatus());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());

        if (p.getOwner() != null) {
            r.setOwner(modelMapper.map(p.getOwner(), com.realestate.dto.UserDto.Response.class));
        }

        // LAND fields + slot summary
        r.setTotalBlocks(p.getTotalBlocks());
        r.setPricePerBlock(p.getPricePerBlock());
        if (p.getPropertyType() == PropertyType.LAND) {
            r.setAvailableBlocks(landBlockRepository.findByPropertyIdAndStatus(p.getId(), SlotStatus.AVAILABLE).stream().count());
            r.setBookedBlocks(landBlockRepository.findByPropertyIdAndStatus(p.getId(), SlotStatus.BOOKED).stream().count());
        }

        // APARTMENT fields + slot summary
        r.setTotalFloors(p.getTotalFloors());
        r.setUnitsPerFloor(p.getUnitsPerFloor());
        r.setPricePerUnit(p.getPricePerUnit());
        r.setYearBuilt(p.getYearBuilt());
        r.setHasParking(p.getHasParking());
        r.setHasGym(p.getHasGym());
        r.setHasPool(p.getHasPool());
        if (p.getPropertyType() == PropertyType.APARTMENT) {
            long total = apartmentUnitRepository.countByPropertyId(p.getId());
            long avail = apartmentUnitRepository.findByPropertyIdAndStatus(p.getId(), SlotStatus.AVAILABLE).size();
            long booked = apartmentUnitRepository.findByPropertyIdAndStatus(p.getId(), SlotStatus.BOOKED).size();
            r.setTotalUnits(total);
            r.setAvailableUnits(avail);
            r.setBookedUnits(booked);
        }

        // Images
        List<PropertyImageDto.Response> images = imageRepository
                .findByPropertyIdOrderBySortOrderAsc(p.getId())
                .stream().map(img -> {
                    PropertyImageDto.Response ir = new PropertyImageDto.Response();
                    ir.setId(img.getId());
                    ir.setPropertyId(p.getId());
                    ir.setImageData(img.getImageData());
                    ir.setFileName(img.getFileName());
                    ir.setContentType(img.getContentType());
                    ir.setSortOrder(img.getSortOrder());
                    ir.setCreatedAt(img.getCreatedAt());
                    return ir;
                }).collect(Collectors.toList());
        r.setImages(images);

        return r;
    }
}
