package com.projectiaas.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projectiaas.catalog.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
}