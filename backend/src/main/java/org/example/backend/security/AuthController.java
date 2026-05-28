package org.example.backend.security;

import lombok.AllArgsConstructor;
import org.example.backend.logic.Administrador;
import org.example.backend.logic.Empresa;
import org.example.backend.logic.Oferente;
import org.example.backend.logic.Service.AdministradorService;
import org.example.backend.logic.Service.EmpresaService;
import org.example.backend.logic.Service.OferenteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@AllArgsConstructor
public class AuthController {

    private final AdministradorService administradorService;
    private final EmpresaService empresaService;
    private final OferenteService oferenteService;
    private final TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String id = request.getId();
        String clave = request.getClave();

        // 1. Intentar como Administrador
        Administrador admin = administradorService.login(id, clave);
        if (admin != null) {
            // TODO: usar BCrypt: if (!passwordEncoder.matches(clave, admin.getClave())) throw...
            String token = tokenService.generateToken(admin.getIdentificacion(), "Administrador", "ADM");
            return ResponseEntity.ok(new LoginResponse(token, "ADM", "Administrador", admin.getIdentificacion()));
        }

        // 2. Intentar como Empresa (id = correo)
        Empresa empresa = empresaService.login(id, clave);
        if (empresa != null) {
            // TODO: usar BCrypt: if (!passwordEncoder.matches(clave, empresa.getClave())) throw...
            String token = tokenService.generateToken(empresa.getCorreo(), empresa.getNombre(), "EMP");
            return ResponseEntity.ok(new LoginResponse(token, "EMP", empresa.getNombre(), empresa.getCorreo()));
        }

        // 3. Intentar como Oferente (id = correo)
        Oferente oferente = oferenteService.login(id, clave);
        if (oferente != null) {
            // TODO: usar BCrypt: if (!passwordEncoder.matches(clave, oferente.getClave())) throw...
            String token = tokenService.generateToken(oferente.getIdentificacion(), oferente.getNombre(), "OFE");
            return ResponseEntity.ok(new LoginResponse(token, "OFE", oferente.getNombre(), oferente.getIdentificacion()));
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
    }
}
