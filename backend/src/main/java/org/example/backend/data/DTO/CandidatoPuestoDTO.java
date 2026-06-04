package org.example.backend.data.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CandidatoPuestoDTO {

    private String identificacion;
    private String nombre;

    private int requisitosCumplidos;
    private int totalRequisitos;

    private double porcentaje;
}
