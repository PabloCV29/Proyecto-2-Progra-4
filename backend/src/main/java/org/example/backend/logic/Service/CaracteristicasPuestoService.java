package org.example.backend.logic.Service;

import org.example.backend.data.CaracteristicasPuestoRepository;
import org.example.backend.data.HabilidadRepository;
import org.example.backend.logic.CaracteristicasPuesto;
import org.example.backend.logic.Habilidad;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CaracteristicasPuestoService {

    @Autowired
    private HabilidadRepository habilidadRepository;

    @Autowired
    private CaracteristicasPuestoRepository caracteristicasPuesto;


    public List<CaracteristicasPuesto> listarPorPuesto(Long idPuesto){
        return caracteristicasPuesto.findByPuestoId(idPuesto);
    }

    public void agregar(CaracteristicasPuesto puestoCaracteristica) {
        caracteristicasPuesto.save(puestoCaracteristica);
    }

    public double calcularCoincidencia(Long puestoId, String oferenteId) {
        List<CaracteristicasPuesto> requisitos =
                caracteristicasPuesto.findByPuestoId(puestoId);

        if (requisitos.isEmpty()) return 0;

        int cumplidos = 0;
        for (CaracteristicasPuesto requisito : requisitos) {
            Habilidad habilidad = habilidadRepository.findByOferenteIdentificacionAndCaracteristicaId(
                    oferenteId,
                    requisito.getCaracteristicas().getId()
            ).orElse(null);

            if (habilidad != null &&
                    habilidad.getNivel() >= requisito.getNivelRequerido()) {
                cumplidos++;
            }
        }
        return (double) cumplidos / requisitos.size() * 100;
    }
}
