import { createContext, useContext, useState, useCallback } from "react";

// ─── Context ────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

// Base URL del backend Spring Boot
const API_BASE = "http://localhost:8080/api";

// ─── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
    const [puestos, setPuestos]     = useState([]);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);
    const [puestoDetalle, setPuestoDetalle] = useState(null);

    // Obtiene los últimos 5 puestos registrados
    const fetchUltimosPuestos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/puestos/ultimos`);
            if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
            const data = await res.json();
            setPuestos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtiene el detalle de un puesto por su ID
    const fetchDetallePuesto = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/puestos/${id}`);
            if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
            const data = await res.json();
            setPuestoDetalle(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpia el detalle activo (para cerrar modal / navegar atrás)
    const clearDetalle = useCallback(() => setPuestoDetalle(null), []);

    const value = {
        puestos,
        loading,
        error,
        puestoDetalle,
        fetchUltimosPuestos,
        fetchDetallePuesto,
        clearDetalle,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
    return ctx;
}