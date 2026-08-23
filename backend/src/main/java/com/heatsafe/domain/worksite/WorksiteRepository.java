package com.heatsafe.domain.worksite;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorksiteRepository extends JpaRepository<Worksite, Long> {
}
