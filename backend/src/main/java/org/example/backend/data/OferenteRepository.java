package org.example.backend.data;

import org.example.backend.logic.Oferente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OferenteRepository extends JpaRepository<Oferente, String> {
    List<Oferente> findByAprobadoFalse();
    List<Oferente> findByAprobadoTrue();
    Optional<Oferente> findByCorreo(String correo);
}
