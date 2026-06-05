import { useState, useEffect } from "react";
import { usePendientes } from "../hooks/usePendientes";
import "./dashboardAdmin.css";

// ── Sección Características ──────────────────────────────────────────────────
function SeccionCaracteristicas() {
    const token = localStorage.getItem("token");
    const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const [raices, setRaices]         = useState([]);   // FIX: árbol desde raíces, no findAll
    const [loading, setLoading]       = useState(true);
    const [mensaje, setMensaje]       = useState("");
    const [error, setError]           = useState("");
    const [nombre, setNombre]         = useState("");
    const [padreId, setPadreId]       = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [editNombre, setEditNombre] = useState("");

    // FIX: usar /api/admin/caracteristicas (raíces con hijos anidados)
    // en lugar de /todas (findAll plano sin hijos)
    const cargar = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/caracteristicas", { headers: authHeaders });
            const data = await res.json();
            setRaices(data);
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

    // FIX: ahora recibe el árbol correcto (raíces con hijos anidados)
    const aplanar = (nodos, padre = null, nivel = 0) => {
        const result = [];
        for (const n of nodos) {
            result.push({ id: n.id, nombre: n.nombre, padreNombre: padre, nivel });
            if (n.hijos?.length > 0) result.push(...aplanar(n.hijos, n.nombre, nivel + 1));
        }
        return result;
    };

    const filas = aplanar(raices);

    return (
        <div>
            <h2 className="dash-titulo">Gestión de Características</h2>

            {mensaje && <div className="dash-mensaje">{mensaje}</div>}
            {error && (
                <div className="dash-mensaje dash-mensaje--error">
                    {error}
                </div>
            )}

            {/* ── Formulario crear ── */}
            <div className="carac-form-row">
                <div className="carac-form-grupo">
                    <label className="carac-label">Nombre</label>
                    <input
                        className="carac-input"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Ej: JavaScript"
                        onKeyDown={e => e.key === "Enter" && handleCrear()}
                    />
                </div>
                <div className="carac-form-grupo">
                    <label className="carac-label">Padre (opcional)</label>
                    <select
                        className="carac-select"
                        value={padreId}
                        onChange={e => setPadreId(e.target.value)}
                    >
                        <option value="">— Sin padre (raíz) —</option>
                        {filas.map(f => (
                            <option key={f.id} value={f.id}>
                                {"  ".repeat(f.nivel)}{f.nivel > 0 ? "└ " : ""}{f.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="btn-aprobar carac-btn-agregar" onClick={handleCrear}>
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
                        <th style={{ width: "50px" }}>ID</th>
                        <th>Nombre</th>
                        <th>Categoría padre</th>
                        <th style={{ width: "160px" }}>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filas.map(f => (
                        <tr key={f.id}>
                            <td className="carac-td-id">{f.id}</td>
                            <td>
                                {editandoId === f.id ? (
                                    <input
                                        className="carac-input carac-input--edit"
                                        value={editNombre}
                                        onChange={e => setEditNombre(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") handleEditar(f.id);
                                            if (e.key === "Escape") setEditandoId(null);
                                        }}
                                        autoFocus
                                    />
                                ) : (
                                    <span style={{ paddingLeft: `${f.nivel * 18}px` }}>
                                            {f.nivel > 0 && <span className="carac-rama">└ </span>}
                                        {f.nombre}
                                        </span>
                                )}
                            </td>
                            <td className="carac-td-padre">
                                {f.padreNombre ?? <span className="carac-sin-padre">—</span>}
                            </td>
                            <td>
                                {/* FIX: acciones en div flex, no en td directo */}
                                <div className="carac-acciones">
                                    {editandoId === f.id ? (
                                        <>
                                            <button
                                                className="btn-aprobar"
                                                onClick={() => handleEditar(f.id)}
                                            >
                                                Guardar
                                            </button>

                                            <button
                                                className="btn-cancelar"
                                                onClick={() => setEditandoId(null)}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-aprobar btn-editar"
                                                onClick={() => { setEditandoId(f.id); setEditNombre(f.nombre); }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn-aprobar btn-eliminar-carac"
                                                onClick={() => handleEliminar(f.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    )}
                                </div>
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
    // FIX: mostrar la cédula (userId) no el nombre "Administrador"
    const cedula = localStorage.getItem("userId") || "Admin";
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
                    {/* FIX: cedula en vez de nombre */}
                    <span className="dash-user">ID: {cedula}</span>
                    <button className="btn-logout" onClick={onLogout}>Cerrar sesión</button>
                </div>
            </nav>

            <main className="dash-main">
                {mensaje && <div className="dash-mensaje">{mensaje}</div>}
                {errorMsg && (
                    <div className="dash-mensaje dash-mensaje--error">
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