import { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);
const API_BASE = "/api";

export function AppProvider({ children }) {
    const [puestos, setPuestos]             = useState([]);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState(null);
    const [puestoDetalle, setPuestoDetalle] = useState(null);

    // ── AUTH ──────────────────────────────────────────────────────────────────
    const [usuario, setUsuario] = useState(() => {
        const saved = sessionStorage.getItem("usuario");
        return saved ? JSON.parse(saved) : null;
    });

    const login = useCallback(async (rol, credenciales) => {
        const rutas = {
            ADMIN:    "/api/admin/login",
            EMPRESA:  "/api/empresa/login",
            OFERENTE: "/api/oferente/login",
        };
        const res  = await fetch(rutas[rol], {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(credenciales),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
        sessionStorage.setItem("usuario", JSON.stringify(data));
        setUsuario(data);
        return data;
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem("usuario");
        setUsuario(null);
    }, []);

    // ── PUESTOS ───────────────────────────────────────────────────────────────
    const fetchUltimosPuestos = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API_BASE}/puestos/ultimos`);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            setPuestos(await res.json());
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    const fetchDetallePuesto = useCallback(async (id) => {
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API_BASE}/puestos/${id}`);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            setPuestoDetalle(await res.json());
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    const clearDetalle = useCallback(() => setPuestoDetalle(null), []);

    return (
        <AppContext.Provider value={{
            puestos, loading, error,
            puestoDetalle, fetchUltimosPuestos, fetchDetallePuesto, clearDetalle,
            usuario, login, logout,
        }}>
            {children}
        </AppContext.Provider>
    );
}

// Intellij nos estaba marcando el useApp() con un error, el comentario de abajo hace que no lo trate como error y compile normal, no rompe nada.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
    return ctx;
}