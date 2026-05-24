package org.example.backend;

import org.example.backend.data.DTO.PuestoResumenDTO;
import org.example.backend.data.PuestoRepository;
import org.example.backend.logic.Empresa;
import org.example.backend.logic.Oferente;
import org.example.backend.logic.Puesto;
import org.example.backend.logic.Service.EmpresaService;
import org.example.backend.logic.Service.OferenteService;
import org.example.backend.logic.Service.PuestoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping ("/api")
@CrossOrigin(origins = "*")
public class Controller {
    @Autowired
    private PuestoRepository puestoRepository;

    @Autowired
    private PuestoService puestoService;

    @Autowired
    private EmpresaService empresaService;//Este es el correcto

    @Autowired
    private OferenteService oferenteService;

    @GetMapping("/puestos/ultimos")
    public List<PuestoResumenDTO> getUltimosPuestos() {
        return puestoService.list5Ultimos()
                .stream()
                .map(PuestoResumenDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/puestos")
    public List<Puesto> getAllPuestos() {
        return puestoRepository.findByActivoTrue();
    }

    @GetMapping("/puestos/{id}")
    public PuestoResumenDTO getDetallePuesto(@PathVariable Long id) {
        Puesto p = puestoService.buscarPuestoPorId(id);
        if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return new PuestoResumenDTO(p);
    }

    @GetMapping("/puestos/buscar")
    public ResponseEntity<List<Puesto>> buscarPuestos(@RequestParam("q") String keyword) {
        List<Puesto> resultados = puestoRepository
                .findByDescripcionContainingIgnoreCaseOrEmpresaContainingIgnoreCase(keyword, keyword);
        return ResponseEntity.ok(resultados);
    }

    @PostMapping("/puestos")
    public ResponseEntity<Puesto> crearPuesto(@RequestBody Puesto puesto) {
        Puesto nuevo = puestoRepository.save(puesto);
        return ResponseEntity.ok(nuevo);
    }

    @PutMapping("/puestos/{id}")
    public ResponseEntity<Puesto> actualizarPuesto(@PathVariable Long id,
                                                   @RequestBody Puesto datosPuesto) {
        return puestoRepository.findById(id).map(p -> {
            p.setDescripcion(datosPuesto.getDescripcion());
            p.setEmpresa(datosPuesto.getEmpresa());
            p.setSalario(datosPuesto.getSalario());
            p.setDescripcion(datosPuesto.getDescripcion());
            p.setActivo(datosPuesto.isActivo());
            return ResponseEntity.ok(puestoRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/puestos/{id}")
    public ResponseEntity<Void> eliminarPuesto(@PathVariable Long id) {
        if (!puestoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        puestoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/empresa/registro")
    public ResponseEntity<Map<String, Object>> registrarEmpresa(@RequestBody Empresa empresa) {
        Map<String, Object> response = new HashMap<>();
        System.out.println("Empresa recibida: " + empresa.getCorreo() + " - " + empresa.getNombre());
        try {
            empresaService.registrar(empresa);
            response.put("mensaje", "Registro exitoso. Esperá la aprobación del administrador.");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("error", "Error al registrar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    @PostMapping("/oferente/registro")
    public ResponseEntity<Map<String, Object>> registrarOferente(@RequestBody Oferente oferente) {
        Map<String, Object> response = new HashMap<>();
        try {
            oferenteService.registrar(oferente);
            response.put("mensaje", "Registro exitoso. Esperá la aprobación del administrador.");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("error", "Error al registrar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}