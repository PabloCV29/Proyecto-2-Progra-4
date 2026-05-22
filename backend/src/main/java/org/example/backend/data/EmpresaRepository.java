package org.example.backend.data;

import org.example.backend.logic.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmpresaRepository extends JpaRepository<Empresa, String> {
    List<Empresa> findByAprobadoFalse();
}
