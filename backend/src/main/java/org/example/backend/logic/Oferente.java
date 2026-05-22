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
public class Oferente {
    @Id
    @Column(length = 20, nullable = false)
    private String identificacion;
    @Column(length = 40)
    private String nombre;
    @Column(length = 40)
    private String apellido;
    @Column(length = 20)
    private String nacionalidad;
    @Column(length = 15)
    private String telefono;
    @Column(length = 50)
    private String correo;
    @Column(length = 50)
    private String residencia;
    @Column(length = 60)
    private String clave;
    private boolean aprobado;
    private String curriculum;

    @OneToMany(mappedBy = "oferente")
    private List<Habilidad> habilidades;
}
