package org.example.backend.logic;


import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Puesto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descripcion;
    private double salario;
    private boolean publico;
    private boolean activo;

    @ManyToOne
    @JoinColumn(name="empresa_correo")
    private Empresa empresa;

    @OneToMany(mappedBy = "puesto")
    private List<CaracteristicasPuesto> caracteristicasPuestos;
}
