package org.example.backend.data;

import org.example.backend.logic.Puesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PuestoRepository extends JpaRepository<Puesto, Long> {

    List<Puesto> findTop5ByPublicoTrueAndActivoTrueOrderByIdDesc();
    List<Puesto> findByEmpresaCorreo(String correo);
    List<Puesto> findByPublicoTrueAndActivoTrueAndCaracteristicasPuestosCaracteristicasIdIn(
            List<Long> ids);
    @Query("SELECT DISTINCT p FROM Puesto p " +
            "JOIN p.caracteristicasPuestos cp " +
            "WHERE p.publico = true AND p.activo = true " +
            "AND cp.caracteristicas.id = :caracteristicaId")
    List<Puesto> findPublicosByCaracteristica(@Param("caracteristicaId") Long caracteristicaId);
    List<Puesto> findByDescripcionContainingIgnoreCaseOrEmpresaContainingIgnoreCase(String keyword1,String keyword2);
    List<Puesto> findByActivoTrue();
    @Query("SELECT DISTINCT p FROM Puesto p " +
            "JOIN p.caracteristicasPuestos cp " +
            "WHERE p.publico = true AND p.activo = true " +
            "AND cp.caracteristicas.id IN :ids")
    List<Puesto> findPublicosPorAlgunaCaracteristica(@Param("ids") List<Long> ids);

}
