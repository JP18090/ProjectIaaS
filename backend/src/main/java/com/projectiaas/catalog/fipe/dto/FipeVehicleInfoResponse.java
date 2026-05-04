package com.projectiaas.catalog.fipe.dto;

public record FipeVehicleInfoResponse(
        String price,
        String brand,
        String model,
        Integer modelYear,
        String fuel,
        String fipeCode,
        String referenceMonth,
        String vehicleType) {
}