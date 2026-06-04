package org.example.backend.data.DTO;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicarPuestoDTO {

    private String descripcion;
    private double salario;
    private boolean publico;

    private String empresaCorreo;

    private List<CaracteristicaPuestoDTO> caracteristicas;
}
