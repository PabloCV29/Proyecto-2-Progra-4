package org.example.backend.logic.Service;

import org.example.backend.data.*;
import org.example.backend.data.DTO.CandidatoPuestoDTO;
import org.example.backend.data.DTO.CaracteristicaPuestoDTO;
import org.example.backend.data.DTO.PublicarPuestoDTO;
import org.example.backend.logic.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PuestoService {
    @Autowired
    private PuestoRepository puestoRepository;
    @Autowired
    private OferenteRepository oferenteRepository;
    @Autowired
    private CaracteristicasRepository caracteristicasRepository;

    @Autowired
    private CaracteristicasPuestoRepository caracteristicasPuestoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

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

    public List<Puesto> buscarPorCaracteristicas(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();

        // Buscar puestos que tengan la primera característica
        List<Puesto> candidatos = puestoRepository.findPublicosByCaracteristica(ids.get(0));

        // Retener solo los que también tengan TODAS las demás
        for (int i = 1; i < ids.size(); i++) {
            List<Puesto> conEsta = puestoRepository.findPublicosByCaracteristica(ids.get(i));
            candidatos.retainAll(conEsta);
        }

        return candidatos;
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
                .filter(c -> c.getRequisitosCumplidos() > 0)
                .sorted((a,b) ->
                        Double.compare(
                                b.getPorcentaje(),
                                a.getPorcentaje()))
                .toList();
    }

    @Transactional
    public void publicarPuestoCompleto(PublicarPuestoDTO dto) {

        Empresa empresa =
                empresaRepository.findById(dto.getEmpresaCorreo())
                        .orElseThrow();

        Puesto puesto = new Puesto();

        puesto.setDescripcion(dto.getDescripcion());
        puesto.setSalario(dto.getSalario());
        puesto.setPublico(dto.isPublico());
        puesto.setActivo(true);
        puesto.setEmpresa(empresa);

        puesto = puestoRepository.save(puesto);

        for (CaracteristicaPuestoDTO c : dto.getCaracteristicas()) {

            Caracteristicas caracteristica =
                    caracteristicasRepository
                            .findById(c.getCaracteristicaId())
                            .orElseThrow();

            CaracteristicasPuesto cp =
                    new CaracteristicasPuesto();

            cp.setPuesto(puesto);
            cp.setCaracteristicas(caracteristica);
            cp.setNivelRequerido(c.getNivel());

            caracteristicasPuestoRepository.save(cp);
        }
    }
    public List<Puesto> buscarPorAlgunaCaracteristica(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return puestoRepository.findPublicosPorAlgunaCaracteristica(ids);
    }
}
