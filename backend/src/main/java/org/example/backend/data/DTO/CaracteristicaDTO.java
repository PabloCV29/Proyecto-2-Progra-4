package org.example.backend.data.DTO;

import org.example.backend.logic.Caracteristicas;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CaracteristicaDTO {

    private Long id;
    private String nombre;
    private List<CaracteristicaDTO> hijos;

    public CaracteristicaDTO(Caracteristicas c) {
        this.id     = c.getId();
        this.nombre = c.getNombre();

        if (c.getHijos() != null && !c.getHijos().isEmpty()) {
            this.hijos = c.getHijos().stream()
                    .map(CaracteristicaDTO::new)
                    .collect(Collectors.toList());
        } else {
            this.hijos = Collections.emptyList();
        }
    }

    /* Getters */
    public Long getId()                    { return id; }
    public String getNombre()              { return nombre; }
    public List<CaracteristicaDTO> getHijos() { return hijos; }
}
