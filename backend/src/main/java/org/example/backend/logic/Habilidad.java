package org.example.backend.logic;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Habilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int nivel;              // nivel 1-5

    @ManyToOne
    @JoinColumn(name = "oferente_id")
    private Oferente oferente;

    @ManyToOne
    @JoinColumn(name = "caracteristica_id")
    private Caracteristicas caracteristica;
}
