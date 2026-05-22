package org.example.backend.data;

import org.example.backend.logic.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministradorRepository extends JpaRepository<Administrador, String> {
}
