package org.example.backend.presentation;

import org.example.backend.data.DTO.CandidatoPuestoDTO;
import org.example.backend.data.DTO.PublicarPuestoDTO;
import org.example.backend.data.DTO.PuestoResumenDTO;
import org.example.backend.data.OferenteRepository;
import org.example.backend.logic.Oferente;
import org.example.backend.logic.Puesto;
import org.example.backend.logic.Service.PuestoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping ("/api/empresa")
@CrossOrigin(origins = "*")
public class DashBoardEmpresaController {

    @Autowired
    private PuestoService puestoService;

    @PutMapping("/puestos/{id}/activar")
    public ResponseEntity<Map<String, Object>> activarPuesto(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        Puesto puesto = puestoService.buscarPuestoPorId(id);
        if (puesto == null) {
            response.put("error", "Puesto no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        puesto.setActivo(true);
        puestoService.publicarPuesto(puesto);
        response.put("mensaje", "Puesto activado correctamente");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/puestos/{id}/desactivar")
    public ResponseEntity<Map<String, Object>> desactivarPuesto(
            @PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        Puesto puesto = puestoService.buscarPuestoPorId(id);
        if (puesto == null) {
            response.put("error", "Puesto no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        puestoService.desactivar(id);
        response.put("mensaje", "Puesto desactivado correctamente");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/puestos")
    public ResponseEntity<?> publicarPuesto(
            @RequestBody PublicarPuestoDTO dto) {
        puestoService.publicarPuestoCompleto(dto);
        return ResponseEntity.ok(
                Map.of(
                        "mensaje",
                        "Puesto publicado correctamente"
                )
        );
    }

    @GetMapping("/puestos")
    public ResponseEntity<List<PuestoResumenDTO>> getPuestosPorEmpresa(@RequestParam String correo) {
        System.out.println("Buscando puestos para: " + correo); // ← log temporal
        List<PuestoResumenDTO> lista = puestoService.listarPorEmpresa(correo)
                .stream()
                .map(PuestoResumenDTO::new)
                .collect(Collectors.toList());
        System.out.println("Puestos encontrados: " + lista.size()); // ← log temporal
        return ResponseEntity.ok(lista);
    }


    @GetMapping("/puestos/{id}/candidatos")
    public ResponseEntity<?> candidatos(@PathVariable Long id) {
        System.out.println("Entrando a candidatos");
        System.out.println("ID recibido: " + id);
        return ResponseEntity.ok(puestoService.buscarCandidatos(id));
    }

    @Autowired
    private OferenteRepository oferenteRepository;

    @GetMapping("/oferentes/{id}")
    public ResponseEntity<Oferente> obtenerOferente(
            @PathVariable String id) {
        Oferente oferente =
                oferenteRepository.findById(id)
                        .orElse(null);
        if(oferente == null){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(oferente);
    }

}
