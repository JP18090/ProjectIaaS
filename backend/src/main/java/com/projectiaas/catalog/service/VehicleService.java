package com.projectiaas.catalog.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.projectiaas.catalog.dto.VehicleRequest;
import com.projectiaas.catalog.dto.VehicleResponse;
import com.projectiaas.catalog.entity.Vehicle;
import com.projectiaas.catalog.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<VehicleResponse> findAll() {
        return vehicleRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public VehicleResponse findById(Long id) {
        return vehicleRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> notFound(id));
    }

    public VehicleResponse create(VehicleRequest request) {
        Vehicle vehicle = new Vehicle();
        apply(vehicle, request);
        return toResponse(vehicleRepository.save(vehicle));
    }

    public VehicleResponse update(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> notFound(id));

        apply(vehicle, request);
        return toResponse(vehicleRepository.save(vehicle));
    }

    public void delete(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> notFound(id));
        vehicleRepository.delete(vehicle);
    }

    private void apply(Vehicle vehicle, VehicleRequest request) {
        vehicle.setBrand(request.brand());
        vehicle.setModel(request.model());
        vehicle.setYear(request.year());
        vehicle.setColor(request.color());
        vehicle.setPrice(request.price());
        vehicle.setMileage(request.mileage() == null ? 0 : request.mileage());
        vehicle.setFuelType(request.fuelType());
        vehicle.setTransmission(request.transmission());
        vehicle.setStatus(request.status());
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getColor(),
                vehicle.getPrice(),
                vehicle.getMileage(),
                vehicle.getFuelType(),
                vehicle.getTransmission(),
                vehicle.getStatus(),
                vehicle.getCreatedAt());
    }

    private ResponseStatusException notFound(Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Veiculo nao encontrado: " + id);
    }
}