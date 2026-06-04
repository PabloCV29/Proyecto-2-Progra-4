package org.example.backend.presentation;

import org.example.backend.data.DTO.CaracteristicaDTO;
import org.example.backend.logic.Caracteristicas;
import org.example.backend.logic.Service.CaracteristicasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/caracteristicas")
@CrossOrigin(origins = "*")
public class CaracteristicasAdminController {

    @Autowired
    private CaracteristicasService caracteristicasService;

    // GET todas las raíces con sus hijos (árbol completo)
    @GetMapping
    public ResponseEntity<List<CaracteristicaDTO>> listar() {
        List<CaracteristicaDTO> arbol = caracteristicasService.buscarRaices()
                .stream()
                .map(CaracteristicaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(arbol);
    }

    // GET lista plana de todas las características (para el dropdown de "padre")
    @GetMapping("/todas")
    public ResponseEntity<List<CaracteristicaDTO>> todas() {
        List<CaracteristicaDTO> lista = caracteristicasService.findAll()
                .stream()
                .map(CaracteristicaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    // POST crear nueva característica
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Map<String, Object> body) {
        Map<String, Object> res = new HashMap<>();
        try {
            String nombre = body.get("nombre").toString().trim();
            if (nombre.isEmpty()) {
                res.put("error", "El nombre no puede estar vacío");
                return ResponseEntity.badRequest().body(res);
            }

            Caracteristicas nueva = new Caracteristicas();
            nueva.setNombre(nombre);

            // Si viene padreId, asignar padre
            if (body.get("padreId") != null && !body.get("padreId").toString().equals("null")) {
                Long padreId = Long.valueOf(body.get("padreId").toString());
                Caracteristicas padre = caracteristicasService.buscarRaiceById(padreId);
                if (padre == null) {
                    res.put("error", "El padre indicado no existe");
                    return ResponseEntity.badRequest().body(res);
                }
                nueva.setPadre(padre);
            }

            caracteristicasService.crear(nueva);
            res.put("mensaje", "Característica creada correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(res);

        } catch (Exception e) {
            res.put("error", "Error al crear: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    // PUT editar nombre
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> editar(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> res = new HashMap<>();
        try {
            String nombre = body.get("nombre").toString().trim();
            if (nombre.isEmpty()) {
                res.put("error", "El nombre no puede estar vacío");
                return ResponseEntity.badRequest().body(res);
            }
            caracteristicasService.actualizar(id, nombre);
            res.put("mensaje", "Actualizada correctamente");
            return ResponseEntity.ok(res);
        } catch (IllegalArgumentException e) {
            res.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        } catch (Exception e) {
            res.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    // DELETE eliminar (solo si no tiene hijos)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        Map<String, Object> res = new HashMap<>();
        try {
            caracteristicasService.eliminar(id);
            res.put("mensaje", "Eliminada correctamente");
            return ResponseEntity.ok(res);
        } catch (IllegalStateException e) {
            res.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(res);
        } catch (IllegalArgumentException e) {
            res.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }
    }
}