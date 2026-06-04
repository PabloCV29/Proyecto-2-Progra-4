import { useState, useEffect } from "react";
import { usePendientes } from "../hooks/usePendientes";
import "./dashboardAdmin.css";

// ── Sección Características ──────────────────────────────────────────────────
// IMPORTANTE: debe estar FUERA de DashboardAdmin, no adentro
function SeccionCaracteristicas() {
    const token = localStorage.getItem("token");
    const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const [todas, setTodas]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [mensaje, setMensaje]           = useState("");
    const [error, setError]               = useState("");
    const [nombre, setNombre]             = useState("");
    const [padreId, setPadreId]           = useState("");
    const [editandoId, setEditandoId]     = useState(null);
    const [editNombre, setEditNombre]     = useState("");

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/caracteristicas/todas", { headers: authHeaders });
            const data = await res.json();
            setTodas(data);
        } catch {
            setError("Error al cargar características");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    const mostrarMensaje = (texto, esError = false) => {
        if (esError) { setError(texto); setMensaje(""); }
        else { setMensaje(texto); setError(""); }
        setTimeout(() => { setMensaje(""); setError(""); }, 3500);
    };

    const handleCrear = async () => {
        if (!nombre.trim()) { mostrarMensaje("El nombre es obligatorio", true); return; }
        const res = await fetch("/api/admin/caracteristicas", {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ nombre: nombre.trim(), padreId: padreId || null }),
        });
        const data = await res.json();
        if (res.ok) {
            mostrarMensaje(data.mensaje);
            setNombre("");
            setPadreId("");
            cargar();
        } else {
            mostrarMensaje(data.error, true);
        }
    };

    const handleEliminar = async (id) => {
        if (!confirm("¿Eliminar esta característica?")) return;
        const res = await fetch(`/api/admin/caracteristicas/${id}`, {
            method: "DELETE",
            headers: authHeaders,
        });
        const data = await res.json();
        if (res.ok) { mostrarMensaje(data.mensaje); cargar(); }
        else { mostrarMensaje(data.error, true); }
    };

    const handleEditar = async (id) => {
        if (!editNombre.trim()) { mostrarMensaje("El nombre no puede estar vacío", true); return; }
        const res = await fetch(`/api/admin/caracteristicas/${id}`, {
            method: "PUT",
            headers: authHeaders,
            body: JSON.stringify({ nombre: editNombre.trim() }),
        });
        const data = await res.json();
        if (res.ok) {
            mostrarMensaje(data.mensaje);
            setEditandoId(null);
            cargar();
        } else {
            mostrarMensaje(data.error, true);
        }
    };

    // Convierte el árbol en lista plana para la tabla y el dropdown
    const aplanar = (nodos, padre = null, nivel = 0) => {
        const result = [];
        for (const n of nodos) {
            result.push({ id: n.id, nombre: n.nombre, padreNombre: padre, nivel });
            if (n.hijos?.length > 0) result.push(...aplanar(n.hijos, n.nombre, nivel + 1));
        }
        return result;
    };

    const filas = aplanar(todas);

    return (
        <div>
            <h2 className="dash-titulo">Gestión de Características</h2>

            {mensaje && <div className="dash-mensaje">{mensaje}</div>}
            {error && (
                <div className="dash-mensaje" style={{ background: "#f8d7da", color: "#721c24", borderColor: "#f5c6cb" }}>
                    {error}
                </div>
            )}

            {/* ── Formulario crear ── */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600 }}>Nombre</label>
                    <input
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Ej: JavaScript"
                        onKeyDown={e => e.key === "Enter" && handleCrear()}
                        style={{ padding: "7px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px", minWidth: "200px" }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600 }}>Padre (opcional)</label>
                    <select
                        value={padreId}
                        onChange={e => setPadreId(e.target.value)}
                        style={{ padding: "7px 10px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px", minWidth: "180px" }}
                    >
                        <option value="">— Sin padre (raíz) —</option>
                        {filas.map(f => (
                            <option key={f.id} value={f.id}>
                                {"  ".repeat(f.nivel)}{f.nivel > 0 ? "└ " : ""}{f.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="btn-aprobar" onClick={handleCrear} style={{ padding: "8px 18px" }}>
                    + Agregar
                </button>
            </div>

            {/* ── Tabla ── */}
            {loading && <p className="estado-msg">Cargando…</p>}
            {!loading && filas.length === 0 && (
                <p className="estado-msg">No hay características registradas.</p>
            )}
            {!loading && filas.length > 0 && (
                <table className="dash-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categoría padre</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filas.map(f => (
                        <tr key={f.id}>
                            <td style={{ color: "#999", fontSize: "12px" }}>{f.id}</td>
                            <td>
                                {editandoId === f.id ? (
                                    <input
                                        value={editNombre}
                                        onChange={e => setEditNombre(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") handleEditar(f.id);
                                            if (e.key === "Escape") setEditandoId(null);
                                        }}
                                        autoFocus
                                        style={{ padding: "4px 8px", border: "1px solid #c0392b", borderRadius: "4px", fontSize: "14px" }}
                                    />
                                ) : (
                                    <span style={{ paddingLeft: `${f.nivel * 16}px` }}>
                                            {f.nivel > 0 && <span style={{ color: "#aaa" }}>└ </span>}
                                        {f.nombre}
                                        </span>
                                )}
                            </td>
                            <td style={{ color: "#777", fontSize: "13px" }}>
                                {f.padreNombre ?? <span style={{ color: "#bbb" }}>—</span>}
                            </td>
                            <td style={{ display: "flex", gap: "6px" }}>
                                {editandoId === f.id ? (
                                    <>
                                        <button className="btn-aprobar" onClick={() => handleEditar(f.id)}>
                                            Guardar
                                        </button>
                                        <button
                                            onClick={() => setEditandoId(null)}
                                            style={{ background: "none", border: "1px solid #ccc", borderRadius: "4px", padding: "5px 10px", fontSize: "12px", cursor: "pointer" }}
                                        >
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn-aprobar"
                                            style={{ background: "#2980b9" }}
                                            onClick={() => { setEditandoId(f.id); setEditNombre(f.nombre); }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn-aprobar"
                                            style={{ background: "#c0392b" }}
                                            onClick={() => handleEliminar(f.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// ── Dashboard Admin ──────────────────────────────────────────────────────────
export default function DashboardAdmin({ onLogout }) {
    const nombre = localStorage.getItem("nombre") || "Administrador";
    const [vista, setVista] = useState("inicio");
    const [mensaje, setMensaje] = useState("");

    const { empresasPendientes, oferentesPendientes, stats, refetch, errorMsg } = usePendientes();

    const aprobarEmpresa = async (correo) => {
        const token = localStorage.getItem("token");
        const authHeaders = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        await fetch(`/api/admin/empresas-pendientes/aprobar?correo=${correo}`, {
            method: "POST",
            headers: authHeaders,
        });
        setMensaje("Empresa aprobada");
        refetch();
    };

    const aprobarOferente = async (identificacion) => {
        const token = localStorage.getItem("token");
        const authHeaders = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        await fetch(`/api/admin/oferentes-pendientes/aprobar?identificacion=${identificacion}`, {
            method: "POST",
            headers: authHeaders,
        });
        setMensaje("Oferente aprobado");
        refetch();
    };

    return (
        <div className="dashboard-wrapper">
            <nav className="dash-nav">
                <span className="dash-brand">BolsaEmpleo — Admin</span>
                <div className="dash-nav-links">
                    <button className={vista === "inicio" ? "active" : ""} onClick={() => setVista("inicio")}>
                        Inicio
                    </button>
                    <button className={vista === "empresas" ? "active" : ""} onClick={() => setVista("empresas")}>
                        Empresas {stats.empresasPendientes > 0 && <span className="badge">{stats.empresasPendientes}</span>}
                    </button>
                    <button className={vista === "oferentes" ? "active" : ""} onClick={() => setVista("oferentes")}>
                        Oferentes {stats.oferentesPendientes > 0 && <span className="badge">{stats.oferentesPendientes}</span>}
                    </button>
                    <button className={vista === "caracteristicas" ? "active" : ""} onClick={() => setVista("caracteristicas")}>
                        Características
                    </button>
                </div>
                <div className="dash-nav-right">
                    <span className="dash-user">{nombre}</span>
                    <button className="btn-logout" onClick={onLogout}>Cerrar sesión</button>
                </div>
            </nav>

            <main className="dash-main">
                {mensaje && <div className="dash-mensaje">{mensaje}</div>}
                {errorMsg && (
                    <div className="dash-mensaje" style={{ background: "#f8d7da", color: "#721c24", borderColor: "#f5c6cb" }}>
                        Error cargando pendientes: {errorMsg}
                    </div>
                )}

                {/* ── Inicio ── */}
                {vista === "inicio" && (
                    <div className="dash-cards">
                        <div className="stat-card" onClick={() => setVista("empresas")}>
                            <span className="stat-num">{stats.empresasPendientes}</span>
                            <span className="stat-label">Empresas pendientes</span>
                        </div>
                        <div className="stat-card" onClick={() => setVista("oferentes")}>
                            <span className="stat-num">{stats.oferentesPendientes}</span>
                            <span className="stat-label">Oferentes pendientes</span>
                        </div>
                        <div className="stat-card" onClick={() => setVista("caracteristicas")}>
                            <span className="stat-num">⚙</span>
                            <span className="stat-label">Gestionar características</span>
                        </div>
                    </div>
                )}

                {/* ── Empresas ── */}
                {vista === "empresas" && (
                    <div>
                        <h2 className="dash-titulo">Empresas pendientes de aprobación</h2>
                        {empresasPendientes.length === 0
                            ? <p className="estado-msg">No hay empresas pendientes.</p>
                            : (
                                <table className="dash-table">
                                    <thead>
                                    <tr><th>Correo</th><th>Nombre</th><th>Teléfono</th><th>Acción</th></tr>
                                    </thead>
                                    <tbody>
                                    {empresasPendientes.map((e) => (
                                        <tr key={e.correo}>
                                            <td>{e.correo}</td>
                                            <td>{e.nombre}</td>
                                            <td>{e.telefono}</td>
                                            <td>
                                                <button className="btn-aprobar" onClick={() => aprobarEmpresa(e.correo)}>
                                                    Aprobar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )
                        }
                    </div>
                )}

                {/* ── Oferentes ── */}
                {vista === "oferentes" && (
                    <div>
                        <h2 className="dash-titulo">Oferentes pendientes de aprobación</h2>
                        {oferentesPendientes.length === 0
                            ? <p className="estado-msg">No hay oferentes pendientes.</p>
                            : (
                                <table className="dash-table">
                                    <thead>
                                    <tr><th>Identificación</th><th>Nombre</th><th>Correo</th><th>Acción</th></tr>
                                    </thead>
                                    <tbody>
                                    {oferentesPendientes.map((o) => (
                                        <tr key={o.identificacion}>
                                            <td>{o.identificacion}</td>
                                            <td>{o.nombre} {o.apellido}</td>
                                            <td>{o.correo}</td>
                                            <td>
                                                <button className="btn-aprobar" onClick={() => aprobarOferente(o.identificacion)}>
                                                    Aprobar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )
                        }
                    </div>
                )}

                {/* ── Características ── */}
                {vista === "caracteristicas" && <SeccionCaracteristicas />}
            </main>
        </div>
    );
}