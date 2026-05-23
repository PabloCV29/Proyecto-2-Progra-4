package org.example.backend.logic;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    @JsonBackReference("caracteristica-padre")
    private Caracteristicas padre;

    @OneToMany(mappedBy = "padre")
    @JsonManagedReference("caracteristica-padre")
    private List<Caracteristicas> hijos;
}
