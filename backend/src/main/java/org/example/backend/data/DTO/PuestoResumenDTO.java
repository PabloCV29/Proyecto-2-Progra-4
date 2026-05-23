package org.example.backend.data.DTO;

import lombok.Getter;
import org.example.backend.logic.CaracteristicasPuesto;
import org.example.backend.logic.Puesto;
import java.util.List;

@Getter
public class PuestoResumenDTO {
    private Long id;
    private String descripcion;
    private double salario;
    private String nombreEmpresa;
    private boolean publico;          // ← NUEVO
    private boolean activo;           // ← NUEVO
    private List<CaracteristicasPuesto> caracteristicasPuestos; // ← NUEVO

    public PuestoResumenDTO(Puesto p) {
        this.id                        = p.getId();
        this.descripcion               = p.getDescripcion();
        this.salario                   = p.getSalario();
        this.nombreEmpresa             = p.getEmpresa() != null
                ? p.getEmpresa().getNombre()
                : "Sin empresa";
        this.publico                   = p.isPublico();           // ← NUEVO
        this.activo                    = p.isActivo();            // ← NUEVO
        this.caracteristicasPuestos    = p.getCaracteristicasPuestos(); // ← NUEVO
    }
}