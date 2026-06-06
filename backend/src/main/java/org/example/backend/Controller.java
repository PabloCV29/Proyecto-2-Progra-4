package org.example.backend;

import org.example.backend.data.DTO.CaracteristicaDTO;
import org.example.backend.data.DTO.PuestoResumenDTO;
import org.example.backend.data.PuestoRepository;
import org.example.backend.logic.*;
import org.example.backend.logic.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping ("/api")
@CrossOrigin(origins = "*")
public class Controller {
    @Autowired
    private PuestoRepository puestoRepository;

    @Autowired
    private PuestoService puestoService;

    @Autowired
    private CaracteristicasService caracteristicasService;

    @Autowired
    private EmpresaService empresaService;//Este es el correcto

    @Autowired
    private OferenteService oferenteService;

    @Autowired
    private AdministradorService administradorService;

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

    // Para Log In de Admin
    @PostMapping("/admin/login")
    public ResponseEntity<Map<String, Object>> loginAdmin(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        String id = body.get("identificacion");
        String clave = body.get("clave");

        if (id == null || clave == null) {
            response.put("error", "Identificación y clave son requeridos");
            return ResponseEntity.badRequest().body(response);
        }

        Administrador admin = administradorService.login(id, clave);
        if (admin == null) {
            response.put("error", "Credenciales incorrectas");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        response.put("rol", "ADMIN");
        response.put("identificacion", admin.getIdentificacion());
        return ResponseEntity.ok(response);
    }

    // Para Log In de empresa
    @PostMapping("/empresa/login")
    public ResponseEntity<Map<String, Object>> loginEmpresa(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        String correo = body.get("correo");
        String clave = body.get("clave");

        if (correo == null || clave == null) {
            response.put("error", "Correo y clave son requeridos");
            return ResponseEntity.badRequest().body(response);
        }

        Empresa empresa = empresaService.login(correo, clave);
        if (empresa == null) {
            response.put("error", "Credenciales incorrectas o cuenta no aprobada");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        response.put("rol", "EMPRESA");
        response.put("correo", empresa.getCorreo());
        response.put("nombre", empresa.getNombre());
        return ResponseEntity.ok(response);
    }

    // Para Log In de oferente
    @PostMapping("/oferente/login")
    public ResponseEntity<Map<String, Object>> loginOferente(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        String correo = body.get("correo");
        String clave = body.get("clave");

        if (correo == null || clave == null) {
            response.put("error", "Correo y clave son requeridos");
            return ResponseEntity.badRequest().body(response);
        }

        Oferente oferente = oferenteService.login(correo, clave);
        if (oferente == null) {
            response.put("error", "Credenciales incorrectas o cuenta no aprobada");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        response.put("rol", "OFERENTE");
        response.put("correo", oferente.getCorreo());
        response.put("nombre", oferente.getNombre());
        response.put("identificacion", oferente.getIdentificacion());
        return ResponseEntity.ok(response);
    }

    //Para desactivar puesto
//    @PutMapping("/empresa/puestos/{id}/desactivar")
//    public ResponseEntity<Map<String, Object>> desactivarPuesto(@PathVariable Long id) {
//        Map<String, Object> response = new HashMap<>();
//        Puesto puesto = puestoService.buscarPuestoPorId(id);
//        if (puesto == null) {
//            response.put("error", "Puesto no encontrado");
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//        }
//        puestoService.desactivar(id);
//        response.put("mensaje", "Puesto desactivado correctamente");
//        return ResponseEntity.ok(response);
//    }

    //Para puestos x empresa
//    @GetMapping("/empresa/puestos")
//    public ResponseEntity<List<PuestoResumenDTO>> getPuestosPorEmpresa(@RequestParam String correo) {
//        List<PuestoResumenDTO> lista = puestoService.listarPorEmpresa(correo)
//                .stream()
//                .map(PuestoResumenDTO::new)
//                .collect(java.util.stream.Collectors.toList());
//        return ResponseEntity.ok(lista);
//    }

    //Para activar puesto
//    @PutMapping("/empresa/puestos/{id}/activar")
//    public ResponseEntity<Map<String, Object>> activarPuesto(@PathVariable Long id) {
//        Map<String, Object> response = new HashMap<>();
//        Puesto puesto = puestoService.buscarPuestoPorId(id);
//        if (puesto == null) {
//            response.put("error", "Puesto no encontrado");
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//        }
//        puesto.setActivo(true);
//        puestoService.publicarPuesto(puesto);
//        response.put("mensaje", "Puesto activado correctamente");
//        return ResponseEntity.ok(response);
//    }

    // ── ADMIN ────────────────────────────────────────────────────────────────────

    @GetMapping("/admin/puestos-pendientes")
    public ResponseEntity<List<PuestoResumenDTO>> puestosPendientes() {
        List<PuestoResumenDTO> lista = puestoRepository.findByPublicoFalseAndActivoTrue()
                .stream()
                .map(PuestoResumenDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/admin/puestos-pendientes/aprobar")
    public ResponseEntity<Void> aprobarPuesto(@RequestParam Long id) {
        Puesto puesto = puestoService.buscarPuestoPorId(id);
        if (puesto == null) return ResponseEntity.notFound().build();
        puesto.setPublico(true);
        puestoService.publicarPuesto(puesto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/empresas-pendientes")
    public List<Empresa> empresasPendientes() {
        return empresaService.listaEsperaAprobacion();
    }

    @PostMapping("/admin/empresas-pendientes/aprobar")
    public ResponseEntity<Void> aprobarEmpresa(@RequestParam String correo) {
        Empresa empresa = empresaService.buscarPorCorreo(correo);
        if (empresa != null) empresaService.aprobar(empresa);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/oferentes-pendientes")
    public List<Oferente> oferentesPendientes() {
        return oferenteService.listaEsperaAprobacion();
    }

    @PostMapping("/admin/oferentes-pendientes/aprobar")
    public ResponseEntity<Void> aprobarOferente(@RequestParam String identificacion) {
        oferenteService.aprobar(identificacion);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/caracteristicas/raices")
    public ResponseEntity<List<CaracteristicaDTO>> getRaices() {
        List<Caracteristicas> raices = caracteristicasService.buscarRaices();
        List<CaracteristicaDTO> dto = raices.stream()
                .map(CaracteristicaDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/puestos/buscar-por-caracteristicas")
    public ResponseEntity<List<PuestoResumenDTO>> buscarPorCaracteristicas(
            @RequestParam(required = false) List<Long> ids) {

        List<Puesto> puestos;
        if (ids == null || ids.isEmpty()) {
            puestos = puestoService.list5Ultimos();
        } else {
            // Expandir cada ID seleccionado con todos sus descendientes
            List<Long> idsExpandidos = ids.stream()
                    .flatMap(id -> caracteristicasService
                            .obtenerIdConDescendientes(id).stream())
                    .distinct()
                    .collect(Collectors.toList());

            puestos = puestoService.buscarPorAlgunaCaracteristica(idsExpandidos);
        }

        List<PuestoResumenDTO> resultado = puestos.stream()
                .map(PuestoResumenDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(resultado);
    }
}