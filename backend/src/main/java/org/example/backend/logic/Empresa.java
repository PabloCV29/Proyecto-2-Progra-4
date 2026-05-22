package org.example.backend.logic;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Empresa {
    @Column(length = 50)
    @Id
    private String correo;
    @Column(length = 40)
    private String nombre;
    @Column(length = 15)
    private String telefono;
    @Column(length = 100)
    private String localizacion;
    @Column(length = 60)
    private String clave;
    private boolean aprobado;

    @OneToMany(mappedBy = "empresa")
    private List<Puesto> puestos;
}
