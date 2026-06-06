package org.example.backend.presentation;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Redirige a caulquier ruta no API al index-html de React
    @RequestMapping(value = {
            "/", "/login", "/buscar", "/empresa",
            "/oferente", "/registro-empresa", "/registro-oferente"
    })
    public String spa() {
        return "forward:/index.html";
    }
}