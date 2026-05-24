package org.example.backend.logic.Service;

import org.example.backend.data.OferenteRepository;
import org.example.backend.logic.Oferente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OferenteService {

    @Autowired
    private OferenteRepository oferenteRepository;

    /*@Autowired
    private PasswordEncoder passwordEncoder;*/

    public Oferente login(String correo, String password) {
        Oferente oferente = oferenteRepository.findByCorreo(correo).orElse(null);
        if (oferente != null && oferente.getClave().equals(password) && oferente.getAprobado()) {
            return oferente;
        }
        return null;
    }
    public Oferente buscarPorCorreo(String correo) {
        return oferenteRepository.findByCorreo(correo).orElse(null);
    }

    public void registrar(Oferente oferente) {
        if (oferenteRepository.existsById(oferente.getIdentificacion())) {
            throw new IllegalArgumentException("El oferente ya existe en el sistema");
        }
        //oferente.setClave(passwordEncoder.encode(oferente.getClave()));
        oferente.setAprobado(false);
        oferenteRepository.save(oferente);
    }

    public List<Oferente> listaEsperaAprobacion() {
        return oferenteRepository.findByAprobadoFalse();
    }

    public List<Oferente> listarAprobados() {
        return oferenteRepository.findByAprobadoTrue();
    }

    public void aprobar(String identificacion) {


        Oferente oferente = oferenteRepository.findById(identificacion).orElse(null);
        if (oferente != null) {
            oferente.setAprobado(true);
            oferenteRepository.save(oferente);
        }
    }

    public Oferente buscarPorId(String identificacion) {
        return oferenteRepository.findById(identificacion).orElse(null);
    }

    public void actualizar(Oferente oferente) {
        oferenteRepository.save(oferente);
    }
}
