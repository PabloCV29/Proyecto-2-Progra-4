package org.example.backend.data.DTO;

import org.example.backend.logic.Habilidad;

public class HabilidadDTO {
    private Long id;
    private int nivel;
    private Long caracteristicaId;
    private String nombreCaracteristica;

    public HabilidadDTO(Habilidad h) {
        this.id                  = h.getId();
        this.nivel               = h.getNivel();
        this.caracteristicaId    = h.getCaracteristica() != null ? h.getCaracteristica().getId() : null;
        this.nombreCaracteristica = h.getCaracteristica() != null ? h.getCaracteristica().getNombre() : "—";
    }

    public Long getId()                    { return id; }
    public int getNivel()                  { return nivel; }
    public Long getCaracteristicaId()      { return caracteristicaId; }
    public String getNombreCaracteristica() { return nombreCaracteristica; }
}