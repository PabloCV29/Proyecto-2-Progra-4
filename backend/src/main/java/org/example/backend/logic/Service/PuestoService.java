package org.example.backend.logic.Service;

import org.example.backend.data.PuestoRepository;
import org.example.backend.logic.Puesto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PuestoService {
    @Autowired
    private PuestoRepository puestoRepository;

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
}
