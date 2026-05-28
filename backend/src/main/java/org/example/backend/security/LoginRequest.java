package org.example.backend.security;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String id;       // correo o identificacion
    private String clave;
}