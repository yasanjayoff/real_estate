package com.realestate.repository;

import com.realestate.entity.Property;
import com.realestate.enums.PropertyStatus;
import com.realestate.enums.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByStatus(PropertyStatus status);
    List<Property> findByPropertyType(PropertyType propertyType);
    List<Property> findByOwnerId(Long ownerId);
    List<Property> findByCityIgnoreCase(String city);

    @Query("SELECT p FROM Property p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:type IS NULL OR p.propertyType = :type) AND " +
           "(:city IS NULL OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Property> findWithFilters(
        @Param("status") PropertyStatus status,
        @Param("type") PropertyType type,
        @Param("city") String city,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice
    );
}
