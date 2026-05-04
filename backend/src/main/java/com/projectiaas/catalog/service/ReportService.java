package com.projectiaas.catalog.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.projectiaas.catalog.dto.ReportResponse;
import com.projectiaas.catalog.dto.VehicleResponse;

@Service
public class ReportService {

    private final VehicleService vehicleService;

    public ReportService(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    public ReportResponse generate() {
        List<VehicleResponse> vehicles = vehicleService.findAll();

        long available = vehicles.stream()
                .filter(vehicle -> "available".equalsIgnoreCase(vehicle.status()))
                .count();

        long sold = vehicles.stream()
                .filter(vehicle -> "sold".equalsIgnoreCase(vehicle.status()))
                .count();

        BigDecimal avgPrice = vehicles.isEmpty()
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : vehicles.stream()
                        .map(VehicleResponse::price)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(vehicles.size()), 2, RoundingMode.HALF_UP);

        Map<String, Long> byBrand = vehicles.stream()
                .filter(vehicle -> vehicle.brand() != null && !vehicle.brand().isBlank())
                .collect(LinkedHashMap::new,
                        (map, vehicle) -> map.merge(vehicle.brand(), 1L, Long::sum),
                        Map::putAll);

        return new ReportResponse(
                vehicles.size(),
                available,
                sold,
                avgPrice,
                byBrand,
                LocalDateTime.now());
    }
}