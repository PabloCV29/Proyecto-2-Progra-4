import { useState, useEffect, useRef } from "react";

export function usePendientes() {
    const [empresasPendientes, setEmpresasPendientes] = useState([]);
    const [oferentesPendientes, setOferentesPendientes] = useState([]);
    const refetchRef = useRef(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            const token = localStorage.getItem("token");
            const authHeaders = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };
            try {
                const [resE, resO] = await Promise.all([
                    fetch("/api/admin/empresas-pendientes", { headers: authHeaders }),
                    fetch("/api/admin/oferentes-pendientes", { headers: authHeaders }),
                ]);
                const empresas = await resE.json();
                const oferentes = await resO.json();
                if (!cancelado) {
                    setEmpresasPendientes(empresas);
                    setOferentesPendientes(oferentes);
                }
            } catch(err) {
                if (!cancelado) setErrorMsg(err.message);
            }
        }

        refetchRef.current = cargar;
        cargar();

        return () => { cancelado = true; };
    }, []);

    return {
        empresasPendientes,
        oferentesPendientes,
        errorMsg,           // ← agregar esta línea
        stats: {
            empresasPendientes: empresasPendientes.length,
            oferentesPendientes: oferentesPendientes.length,
        },
        refetch: () => refetchRef.current?.(),
    };
}

/*
Por q cree esta clase: teniamos este Error react-hooks/set-state-in-effect — Análisis y Resolución
El error ocurre porque ESLint analiza el código estáticamente, sin ejecutarlo. Cuando ve que un useEffect llama una función externa (fetchPendientes) que contiene setState, la regla dispara automáticamente — no importa que sea async/await, el linter solo ve la cadena "efecto → función → setState" y asume riesgo de cascada. El primer intento fue mover la función con useCallback, pero ESLint igualmente detectaba los setState dentro. La solución fue definir la función cargar directamente dentro del useEffect como función local async — así el linter la trata como parte del efecto y no como un setState externo síncrono. Adicionalmente se usó un ref (refetchRef) para exponer la capacidad de re-fetch sin necesitar useCallback ni crear dependencias que volvieran a disparar el efecto.
atte : jp
*/
