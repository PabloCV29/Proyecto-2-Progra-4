package org.example.backend.logic;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Caracteristicas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 40, nullable = false)
    private String nombre;

    @ManyToOne
    @JoinColumn(name = "padre_id")
    private Caracteristicas padre;

    @OneToMany(mappedBy = "padre")
    private List<Caracteristicas> hijos;
}
