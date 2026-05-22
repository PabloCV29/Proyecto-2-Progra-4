package org.example.backend.logic;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Administrador {
    @Id
    @Column(length = 20, nullable = false) //Limita el tamanno de la variable
    private String identificacion;
    @Column(length = 60)
    private String clave;
}
