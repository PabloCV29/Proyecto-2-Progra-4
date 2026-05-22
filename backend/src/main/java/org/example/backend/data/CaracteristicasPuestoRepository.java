package org.example.backend.data;

import org.example.backend.logic.CaracteristicasPuesto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaracteristicasPuestoRepository extends JpaRepository<CaracteristicasPuesto, Long> {
    List<CaracteristicasPuesto> findByPuestoId(Long puestoId);

}
