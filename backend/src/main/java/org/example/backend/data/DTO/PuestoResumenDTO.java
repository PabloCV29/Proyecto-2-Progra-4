package org.example.backend.data.DTO;

import lombok.Getter;
import org.example.backend.logic.Puesto;

@Getter
public class PuestoResumenDTO {
    // Getters
    private Long id;
    private String descripcion;
    private double salario;
    private String nombreEmpresa;

    // Constructor que recibe la entidad y extrae lo necesario
    public PuestoResumenDTO(Puesto p) {
        this.id           = p.getId();
        this.descripcion  = p.getDescripcion();
        this.salario      = p.getSalario();
        this.nombreEmpresa = p.getEmpresa() != null
                ? p.getEmpresa().getNombre()
                : "Sin empresa";
    }

}
