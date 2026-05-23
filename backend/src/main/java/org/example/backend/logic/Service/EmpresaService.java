package org.example.backend.logic.Service;

import org.example.backend.data.EmpresaRepository;
import org.example.backend.logic.Empresa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {
    @Autowired
    private EmpresaRepository empresaRepository;

   /* @Autowired
    private PasswordEncoder passwordEncoder;*/

    public Empresa login(String correo, String clave){
        Empresa empresa= empresaRepository.findById(correo).orElse(null);
        if(empresa!=null&&clave.equals(empresa.getClave())&&empresa.isAprobado()){
            return empresa;
        }
        return null;
    }

    public Empresa registrar(Empresa empresa) {
        if (empresaRepository.existsById(empresa.getCorreo())) {
            throw new IllegalArgumentException("La empresa ya existe en el sistema");
        }
        empresa.setAprobado(false);
        return empresaRepository.save(empresa);  // ← retornar la empresa guardada
    }

    public List<Empresa> listaEsperaAprobacion(){
        return empresaRepository.findByAprobadoFalse();
    }

    public void aprobar(Empresa empresa){
        Empresa empresas= empresaRepository.findById(empresa.getCorreo()).orElse(null);
        if(empresas!=null){
            empresas.setAprobado(true);
            empresaRepository.save(empresas);
        }
    }
    public Empresa buscarPorCorreo(String correo) {
        return empresaRepository.findById(correo).orElse(null);}
}
