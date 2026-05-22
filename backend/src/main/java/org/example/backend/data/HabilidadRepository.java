package org.example.backend.data;

import org.example.backend.logic.Habilidad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabilidadRepository extends JpaRepository<Habilidad, Long> {
    List<Habilidad> findByOferenteIdentificacion(String identificacion);
    Optional<Habilidad> findByOferenteIdentificacionAndCaracteristicaId(
            String identificacion, Long caracteristicaId);
}
