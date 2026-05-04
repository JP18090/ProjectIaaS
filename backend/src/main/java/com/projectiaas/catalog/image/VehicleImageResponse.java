package com.projectiaas.catalog.image;

public record VehicleImageResponse(
        String url,
        String thumbnail,
        String title,
        String source) {
}