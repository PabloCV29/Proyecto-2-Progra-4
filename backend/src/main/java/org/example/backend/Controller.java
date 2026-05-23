package org.example.backend;

import org.example.backend.data.PuestoRepository;
import org.example.backend.logic.Puesto;
import org.example.backend.logic.Service.PuestoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping ("/api")
@CrossOrigin(origins = "*")
public class Controller {
    @Autowired
    private PuestoRepository puestoRepository;

    @Autowired
    private PuestoService puestoService; //Este es el correcto

    @GetMapping("/puestos/ultimos")
    public List<Puesto> getUltimosPuestos() {
        return puestoService.list5Ultimos();
    }

    @GetMapping("/puestos")
    public List<Puesto> getAllPuestos() {
        return puestoRepository.findByActivoTrue();
    }

    @GetMapping("/puestos/{id}")
    public ResponseEntity<Puesto> getPuestoById(@PathVariable Long id) {
        return puestoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
}
