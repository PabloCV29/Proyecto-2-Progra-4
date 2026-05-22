package org.example.backend.logic.Service;

import org.example.backend.data.HabilidadRepository;
import org.example.backend.logic.Habilidad;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HabilidadService {
    @Autowired
    private HabilidadRepository habilidadRepository;

    public List<Habilidad> listarPorOferente(String id){
        return habilidadRepository.findByOferenteIdentificacion(id);
    }

    public void agregarHabilidad(Habilidad habilidad){
        habilidadRepository.save(habilidad);
    }

    public void eliminarHabilidad(Long habilidad){
        habilidadRepository.deleteById(habilidad);
    }
}
