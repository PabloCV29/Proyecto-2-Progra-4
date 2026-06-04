package org.example.backend.logic.Service;

import org.example.backend.data.CaracteristicasRepository;
import org.example.backend.logic.Caracteristicas;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CaracteristicasService {

    @Autowired
    private CaracteristicasRepository caracteristicaRepository;

    public List<Caracteristicas> findAll() {
        return caracteristicaRepository.findAll();
    }

    public List<Caracteristicas> buscarRaices(){
        return caracteristicaRepository.findByPadreIsNull();
    }

    public void crear(Caracteristicas caracteristicas){
        caracteristicaRepository.save(caracteristicas);
    }

    public Caracteristicas buscarRaiceById(Long id){
        return  caracteristicaRepository.findById(id).orElse(null);
    }
    public List<Caracteristicas> buscarPorPadre(Long padreId){
        return caracteristicaRepository.findByPadreId(padreId);
    }

    public void eliminar(Long id) {
        Caracteristicas c = caracteristicaRepository.findById(id).orElse(null);
        if (c == null) throw new IllegalArgumentException("Característica no encontrada");
        if (c.getHijos() != null && !c.getHijos().isEmpty()) {
            throw new IllegalStateException("No se puede eliminar: tiene subcategorías. Eliminá primero las hijas.");
        }
        caracteristicaRepository.deleteById(id);
    }

    public void actualizar(Long id, String nuevoNombre) {
        Caracteristicas c = caracteristicaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Característica no encontrada"));
        c.setNombre(nuevoNombre);
        caracteristicaRepository.save(c);
    }
}
