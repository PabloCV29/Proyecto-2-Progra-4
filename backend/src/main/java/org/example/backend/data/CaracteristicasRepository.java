package org.example.backend.data;

import org.example.backend.logic.Caracteristicas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaracteristicasRepository extends JpaRepository<Caracteristicas, Long> {
    List<Caracteristicas> findByPadreIsNull();
    List<Caracteristicas> findByPadreId(Long padreId);
}
