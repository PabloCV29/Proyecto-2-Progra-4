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
}
