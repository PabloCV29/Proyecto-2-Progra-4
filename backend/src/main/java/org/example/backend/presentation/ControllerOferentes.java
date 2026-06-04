package org.example.backend.presentation;

import org.example.backend.data.DTO.HabilidadDTO;
import org.example.backend.logic.*;
import org.example.backend.logic.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/oferente")
@CrossOrigin(origins = "*")
public class ControllerOferentes {

    private static final String CV_DIR =
            System.getProperty("user.home") + "/bolsaempleo-cv/";

    @Autowired private OferenteService oferenteService;
    @Autowired private HabilidadService habilidadService;
    @Autowired private CaracteristicasService caracteristicasService;

    // ── Helper: obtener identificacion desde el JWT ───────────────────────
    private String resolverIdentificacion(Principal principal) {
        if (principal == null) throw new RuntimeException("No autenticado");

        if (principal instanceof org.springframework.security.oauth2.server.resource.authentication
                .JwtAuthenticationToken jwtAuth) {
            String id = jwtAuth.getToken().getClaimAsString("id");
            if (id != null && !id.isBlank()) return id;
        }

        throw new RuntimeException("No se pudo resolver la identificación del token");
    }

    // ── Perfil ────────────────────────────────────────────────────────────
    @GetMapping("/perfil")
    public ResponseEntity<?> perfil(Principal principal) {
        Oferente o = oferenteService.buscarPorId(resolverIdentificacion(principal));
        if (o == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(o);
    }

    // ── Habilidades ───────────────────────────────────────────────────────
    @GetMapping("/mis-habilidades")
    public ResponseEntity<List<HabilidadDTO>> misHabilidades(Principal principal) {
        String id = resolverIdentificacion(principal);
        List<HabilidadDTO> lista = habilidadService.listarPorOferente(id)
                .stream().map(HabilidadDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/mis-habilidades/agregar")
    public ResponseEntity<Map<String, Object>> agregar(
            @RequestBody Map<String, Object> body,
            Principal principal) {

        Map<String, Object> res = new HashMap<>();
        try {
            String id = resolverIdentificacion(principal);
            Oferente oferente = oferenteService.buscarPorId(id);
            if (oferente == null) {
                res.put("error", "Oferente no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
            }
            Long caracId = Long.valueOf(body.get("caracteristicaId").toString());
            int nivel    = Integer.parseInt(body.get("nivel").toString());

            Caracteristicas c = caracteristicasService.buscarRaiceById(caracId);
            if (c == null) {
                res.put("error", "Característica no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
            }

            Habilidad h = new Habilidad();
            h.setNivel(nivel);
            h.setOferente(oferente);
            h.setCaracteristica(c);
            habilidadService.agregarHabilidad(h);

            res.put("mensaje", "Habilidad agregada correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(res);

        } catch (Exception e) {
            res.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    @PostMapping("/mis-habilidades/eliminar")
    public ResponseEntity<Map<String, Object>> eliminar(@RequestParam Long habilidadId) {
        Map<String, Object> res = new HashMap<>();
        try {
            habilidadService.eliminarHabilidad(habilidadId);
            res.put("mensaje", "Habilidad eliminada");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            res.put("error", "Error al eliminar");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    // ── CV ────────────────────────────────────────────────────────────────
    @PostMapping("/mi-cv/subir")
    public ResponseEntity<Map<String, Object>> subirCv(
            @RequestParam("archivo") MultipartFile archivo,
            Principal principal) {

        Map<String, Object> res = new HashMap<>();
        try {
            String id = resolverIdentificacion(principal);
            Oferente oferente = oferenteService.buscarPorId(id);
            if (oferente == null) {
                res.put("error", "Oferente no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
            }
            if (archivo.isEmpty()) {
                res.put("error", "Archivo vacío");
                return ResponseEntity.badRequest().body(res);
            }

            Path destino = Paths.get(CV_DIR + id + ".pdf");
            Files.createDirectories(destino.getParent());
            Files.copy(archivo.getInputStream(), destino,
                    StandardCopyOption.REPLACE_EXISTING);

            oferente.setCurriculum("/cv/" + id + ".pdf");
            oferenteService.actualizar(oferente);

            res.put("mensaje", "CV subido correctamente");
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("error", "Error al subir CV: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    @GetMapping("/cv/{identificacion}")
    public ResponseEntity<Resource> verCv(@PathVariable String identificacion) {
        Oferente oferente = oferenteService.buscarPorId(identificacion);
        if (oferente == null || oferente.getCurriculum() == null)
            return ResponseEntity.notFound().build();

        Path ruta = Paths.get(CV_DIR + identificacion + ".pdf");
        Resource recurso = new FileSystemResource(ruta);
        if (!recurso.exists()) return ResponseEntity.notFound().build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + identificacion + ".pdf\"")
                .body(recurso);
    }
}