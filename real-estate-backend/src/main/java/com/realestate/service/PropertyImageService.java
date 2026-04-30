package com.realestate.service;

import com.realestate.dto.PropertyImageDto;
import com.realestate.entity.Property;
import com.realestate.entity.PropertyImage;
import com.realestate.exception.BadRequestException;
import com.realestate.exception.ResourceNotFoundException;
import com.realestate.repository.PropertyImageRepository;
import com.realestate.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PropertyImageService {

    private static final int MAX_IMAGES = 5;

    private final PropertyImageRepository imageRepository;
    private final PropertyRepository propertyRepository;

    public List<PropertyImageDto.Response> getImagesByProperty(Long propertyId) {
        return imageRepository.findByPropertyIdOrderBySortOrderAsc(propertyId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PropertyImageDto.Response addImage(Long propertyId, PropertyImageDto.UploadRequest request) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", propertyId));

        long count = imageRepository.countByPropertyId(propertyId);
        if (count >= MAX_IMAGES) {
            throw new BadRequestException("Maximum " + MAX_IMAGES + " images allowed per property. Please delete an existing image first.");
        }

        if (request.getImageData() == null || request.getImageData().isBlank()) {
            throw new BadRequestException("Image data is required.");
        }

        PropertyImage image = PropertyImage.builder()
                .property(property)
                .imageData(request.getImageData())
                .fileName(request.getFileName())
                .contentType(request.getContentType())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : (int) count)
                .build();

        return toResponse(imageRepository.save(image));
    }

    public void deleteImage(Long imageId) {
        if (!imageRepository.existsById(imageId)) {
            throw new ResourceNotFoundException("Image", imageId);
        }
        imageRepository.deleteById(imageId);
    }

    public void deleteAllImagesForProperty(Long propertyId) {
        imageRepository.deleteByPropertyId(propertyId);
    }

    public List<PropertyImageDto.Response> replaceImages(Long propertyId, List<PropertyImageDto.UploadRequest> requests) {
        if (requests.size() > MAX_IMAGES) {
            throw new BadRequestException("Cannot upload more than " + MAX_IMAGES + " images.");
        }
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", propertyId));

        imageRepository.deleteByPropertyId(propertyId);

        List<PropertyImage> saved = requests.stream().map(req -> {
            PropertyImage img = PropertyImage.builder()
                    .property(property)
                    .imageData(req.getImageData())
                    .fileName(req.getFileName())
                    .contentType(req.getContentType())
                    .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : requests.indexOf(req))
                    .build();
            return imageRepository.save(img);
        }).collect(Collectors.toList());

        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PropertyImageDto.Response toResponse(PropertyImage image) {
        PropertyImageDto.Response r = new PropertyImageDto.Response();
        r.setId(image.getId());
        r.setPropertyId(image.getProperty() != null ? image.getProperty().getId() : null);
        r.setImageData(image.getImageData());
        r.setFileName(image.getFileName());
        r.setContentType(image.getContentType());
        r.setSortOrder(image.getSortOrder());
        r.setCreatedAt(image.getCreatedAt());
        return r;
    }
}
