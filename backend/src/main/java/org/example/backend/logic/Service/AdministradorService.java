package org.example.backend.logic.Service;

import org.example.backend.data.AdministradorRepository;
import org.example.backend.logic.Administrador;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdministradorService {
    @Autowired
    private AdministradorRepository administradorRepository;


    public Administrador login(String id, String password) {
        Administrador admin = administradorRepository.findById(id).orElse(null);
        if (admin != null && admin.getClave().equals(password)) {
            return admin;
        }
        return null;
    }
}
