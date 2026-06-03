package org.example.backend.logic.Service;

import org.example.backend.data.DTO.CandidatoPuestoDTO;
import org.example.backend.data.OferenteRepository;
import org.example.backend.data.PuestoRepository;
import org.example.backend.logic.CaracteristicasPuesto;
import org.example.backend.logic.Oferente;
import org.example.backend.logic.Puesto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PuestoService {
    @Autowired
    private PuestoRepository puestoRepository;
    @Autowired
    private OferenteRepository oferenteRepository;

    public List<Puesto> list5Ultimos(){
        return puestoRepository.findTop5ByPublicoTrueAndActivoTrueOrderByIdDesc();
    }

    public List<Puesto> listarPorEmpresa(String correoEmpresa){
        return puestoRepository.findByEmpresaCorreo(correoEmpresa);
    }

    public void publicarPuesto(Puesto p){
        p.setActivo(true);
        puestoRepository.save(p);
    }

    public Puesto buscarPuestoPorId(long id){
        return puestoRepository.findById(id).orElse(null);
    }

    public void desactivar(Long id){
        Puesto puesto = buscarPuestoPorId(id);
        if(puesto!=null){
            puesto.setActivo(false);
            puestoRepository.save(puesto);
        }
    }

    public List<Puesto> buscarPorCaracteristica(Long caracteristicaId) {
        return puestoRepository.findPublicosByCaracteristica(caracteristicaId);
    }
    public List<Puesto> buscarPorCaracteristicas(List<Long> ids) {
        return ids.stream()
                .flatMap(id -> puestoRepository
                        .findPublicosByCaracteristica(id).stream())
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }

    public List<CandidatoPuestoDTO> buscarCandidatos(Long puestoId) {
        Puesto puesto = buscarPuestoPorId(puestoId);

        System.out.println("Puesto: " + puesto.getDescripcion());

        List<Oferente> oferentes = oferenteRepository.findAll();

        System.out.println("Oferentes encontrados: " + oferentes.size());

        int totalRequisitos = puesto.getCaracteristicasPuestos().size();

        System.out.println("Requisitos del puesto: " + totalRequisitos);

        return oferentes.stream()
                .map(oferente -> {
                    int cumplidos = 0;
                    for (CaracteristicasPuesto req : puesto.getCaracteristicasPuestos()) {
                        boolean cumple =
                                oferente.getHabilidades().stream()
                                        .anyMatch(h ->
                                                h.getCaracteristica().getId()
                                                        .equals(req.getCaracteristicas().getId())
                                                        &&
                                                        h.getNivel() >= req.getNivelRequerido());

                        if (cumple)
                            cumplidos++;
                    }
                    double porcentaje =
                            totalRequisitos == 0
                                    ? 0
                                    : (cumplidos * 100.0) / totalRequisitos;
                    return new CandidatoPuestoDTO(
                            oferente.getIdentificacion(),
                            oferente.getNombre() + " " + oferente.getApellido(),
                            cumplidos,
                            totalRequisitos,
                            porcentaje
                    );
                })
                //.filter(c -> c.getRequisitosCumplidos() > 0)
                .sorted((a,b) ->
                        Double.compare(
                                b.getPorcentaje(),
                                a.getPorcentaje()))
                .toList();
    }
}
