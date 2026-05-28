package org.example.backend.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Service
@AllArgsConstructor
public class TokenService {

    private final JwtConfig jwtConfig;

    public String generateToken(String id, String nombre, String rol) {
        var header = new JWSHeader.Builder(jwtConfig.getAlgorithm())
                .type(JOSEObjectType.JWT).build();
        Instant now = Instant.now();
        var claims = new JWTClaimsSet.Builder()
                .issuer("BolsaEmpleo")
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(jwtConfig.getJwtExpiration(), ChronoUnit.MILLIS)))
                .claim("scope", List.of(rol))
                .claim("id", id)
                .claim("nombre", nombre)
                .claim("rol", rol)
                .build();
        var jwt = new SignedJWT(header, claims);
        try {
            jwt.sign(new MACSigner(jwtConfig.getSecretKey()));
        } catch (JOSEException e) {
            throw new RuntimeException("Error generando JWT", e);
        }
        return jwt.serialize();
    }
}
