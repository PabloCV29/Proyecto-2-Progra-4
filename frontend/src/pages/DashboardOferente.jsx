import { useState, useEffect, useCallback } from "react";
import "./dashboardAdmin.css";
import "./dashboardOferente.css";

const API = "/api";
const token = () => localStorage.getItem("token");
const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
});

/* ─── Sección: Puestos disponibles ───────────────────────────────────────── */
function SeccionPuestos() {
    const [puestos, setPuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        fetch(`${API}/puestos/ultimos`)
            .then((r) => r.json())
            .then((d) => { setPuestos(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const verDetalle = async (id) => {
        const res = await fetch(`${API}/puestos/${id}`);
        const data = await res.json();
        setDetalle(data);
    };

    return (
        <div>
            <h2 className="dash-titulo">Puestos disponibles</h2>
            {loading && <p className="estado-msg">Cargando puestos…</p>}
            <div className="puestos-grid">
                {puestos.map((p) => (
                    <div key={p.id} className="puesto-card">
                        <span className="puesto-empresa">{p.nombreEmpresa}</span>
                        <h3 className="puesto-nombre">{p.descripcion}</h3>
                        <p className="puesto-salario">
                            ₡ {p.salario.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                        </p>
                        <button className="btn-ver-detalle" onClick={() => verDetalle(p.id)}>
                            Ver detalle
                        </button>
                    </div>
                ))}
            </div>

            {detalle && (
                <div className="modal-overlay" onClick={() => setDetalle(null)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setDetalle(null)}>✕</button>
                        <p className="modal-empresa">{detalle.nombreEmpresa}</p>
                        <h2 className="modal-titulo">{detalle.descripcion}</h2>
                        <p className="modal-salario">
                            ₡ {detalle.salario.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                        </p>
                        {detalle.caracteristicasPuestos?.length > 0 && (
                            <div className="modal-requisitos">
                                <h4>Requisitos</h4>
                                <ul>
                                    {detalle.caracteristicasPuestos.map((cp) => (
                                        <li key={cp.id}>
                                            <span>{cp.caracteristicas?.nombre ?? "—"}</span>
                                            <span className="req-nivel">Nivel {cp.nivelRequerido}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Sección: Mis Habilidades ───────────────────────────────────────────── */
function SeccionHabilidades() {
    const [habilidades, setHabilidades]   = useState([]);
    const [raices, setRaices]             = useState([]);
    const [actualId, setActualId]         = useState(null);
    const [hijos, setHijos]               = useState([]);
    const [nivel, setNivel]               = useState(1);
    const [caracteristicaId, setCaracteristicaId] = useState("");
    const [mensaje, setMensaje]           = useState({ tipo: "", texto: "" });
    const [loading, setLoading]           = useState(true);

    const cargarHabilidades = useCallback(() => {
        fetch(`${API}/oferente/mis-habilidades`, { headers: authHeaders() })
            .then((r) => r.json())
            .then((d) => { setHabilidades(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        cargarHabilidades();
        fetch(`${API}/caracteristicas/raices`)
            .then((r) => r.json())
            .then(setRaices);
    }, [cargarHabilidades]);

    const entrarEnNodo = (nodo) => {
        setActualId(nodo.id);
        setHijos(nodo.hijos ?? []);
        setCaracteristicaId("");
    };

    const volverARaices = () => {
        setActualId(null);
        setHijos([]);
        setCaracteristicaId("");
    };

    const agregarHabilidad = async () => {
        if (!caracteristicaId) {
            setMensaje({ tipo: "error", texto: "Seleccioná una característica." });
            return;
        }
        const res = await fetch(`${API}/oferente/mis-habilidades/agregar`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ caracteristicaId: Number(caracteristicaId), nivel }),
        });
        if (res.ok) {
            setMensaje({ tipo: "exito", texto: "Habilidad agregada." });
            cargarHabilidades();
            setCaracteristicaId("");
        } else {
            setMensaje({ tipo: "error", texto: "Error al agregar habilidad." });
        }
    };

    const eliminarHabilidad = async (id) => {
        await fetch(`${API}/oferente/mis-habilidades/eliminar?habilidadId=${id}`, {
            method: "POST",
            headers: authHeaders(),
        });
        cargarHabilidades();
    };

    return (
        <div className="ofe-habilidades-layout">
            {/* Tabla de habilidades actuales */}
            <div className="ofe-panel">
                <h2 className="dash-titulo">Mis habilidades</h2>
                {loading && <p className="estado-msg">Cargando…</p>}
                {!loading && habilidades.length === 0 && (
                    <p className="estado-msg">No tenés habilidades registradas aún.</p>
                )}
                {habilidades.length > 0 && (
                    <table className="dash-table">
                        <thead>
                        <tr><th>Característica</th><th>Nivel</th><th></th></tr>
                        </thead>
                        <tbody>
                        {habilidades.map((h) => (
                            <tr key={h.id}>
                                <td>{h.nombreCaracteristica}</td>
                                <td>
                                    <span className="nivel-badge">{"★".repeat(h.nivel)}{"☆".repeat(5 - h.nivel)}</span>
                                </td>
                                <td>
                                    <button
                                        className="btn-eliminar"
                                        onClick={() => eliminarHabilidad(h.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Panel para agregar habilidades */}
            <div className="ofe-panel">
                <h2 className="dash-titulo">Agregar habilidad</h2>

                {mensaje.texto && (
                    <div className={`dash-mensaje ${mensaje.tipo === "error" ? "dash-mensaje-error" : ""}`}>
                        {mensaje.texto}
                    </div>
                )}

                {/* Navegación del árbol */}
                <div className="arbol-nav">
                    {actualId === null ? (
                        <>
                            <p className="arbol-label">Seleccioná una categoría:</p>
                            {raices.map((r) => (
                                <button
                                    key={r.id}
                                    className="btn-nodo"
                                    onClick={() => entrarEnNodo(r)}
                                >
                                    {r.nombre} ▸
                                </button>
                            ))}
                        </>
                    ) : (
                        <>
                            <button className="btn-volver-arbol" onClick={volverARaices}>
                                ← Volver a categorías
                            </button>
                            <p className="arbol-label">Subcategorías:</p>
                            {hijos.length === 0 && (
                                <p className="estado-msg" style={{ fontSize: "13px" }}>
                                    No hay subcategorías. Podés agregar esta categoría directamente.
                                </p>
                            )}
                            {hijos.map((h) => (
                                <button
                                    key={h.id}
                                    className={`btn-nodo ${caracteristicaId == h.id ? "btn-nodo--activo" : ""}`}
                                    onClick={() => {
                                        if (h.hijos?.length > 0) {
                                            entrarEnNodo(h);
                                        } else {
                                            setCaracteristicaId(String(h.id));
                                        }
                                    }}
                                >
                                    {h.nombre} {h.hijos?.length > 0 ? "▸" : ""}
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* Formulario de nivel */}
                <div className="ofe-form-nivel">
                    <label>Característica seleccionada:</label>
                    <span className="sel-caracteristica">
                        {caracteristicaId
                            ? (hijos.find((h) => h.id == caracteristicaId)?.nombre
                                ?? raices.find((r) => r.id == actualId)?.nombre
                                ?? "—")
                            : "Ninguna"}
                    </span>

                    <label>Nivel (1-5):</label>
                    <div className="nivel-selector">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                className={`nivel-btn ${nivel >= n ? "nivel-btn--activo" : ""}`}
                                onClick={() => setNivel(n)}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn-aprobar"
                        onClick={agregarHabilidad}
                        disabled={!caracteristicaId}
                    >
                        Agregar habilidad
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Sección: Mi CV ─────────────────────────────────────────────────────── */
function SeccionCV() {
    const id          = localStorage.getItem("userId");
    const [archivo, setArchivo]   = useState(null);
    const [mensaje, setMensaje]   = useState({ tipo: "", texto: "" });
    const [loading, setLoading]   = useState(false);
    const [tieneCv, setTieneCv]   = useState(false);

    useEffect(() => {
        if(!id) return;
        // Verificar si ya tiene CV intentando hacer un HEAD al endpoint
        fetch(`${API}/oferente/perfil`, { headers: authHeaders() })
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data) setTieneCv(data.curriculum != null);
            })
            .catch(() => setTieneCv(false));
    }, [id]);

    const subirCv = async () => {
        if (!archivo) {
            setMensaje({ tipo: "error", texto: "Seleccioná un archivo PDF." });
            return;
        }
        if (archivo.type !== "application/pdf") {
            setMensaje({ tipo: "error", texto: "Solo se aceptan archivos PDF." });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("archivo", archivo);

        try {
            const res = await fetch(`${API}/oferente/mi-cv/subir`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token()}` },
                body: formData,
            });

            if (res.ok) {
                setMensaje({ tipo: "exito", texto: "CV subido correctamente." });
                setTieneCv(true);
                setArchivo(null);
            } else {
                setMensaje({ tipo: "error", texto: "Error al subir el CV." });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "Error de conexión." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ofe-cv-layout">
            <h2 className="dash-titulo">Mi CV</h2>
            <p className="estado-msg">Subí tu currículum en formato PDF.</p>

            {mensaje.texto && (
                <div className={`dash-mensaje ${mensaje.tipo === "error" ? "dash-mensaje-error" : ""}`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="ofe-cv-card">
                <div className="cv-upload-area">
                    <span className="cv-icon">📄</span>
                    <label className="cv-file-label">
                        {archivo ? archivo.name : "Seleccioná tu CV (PDF)"}
                        <input
                            type="file"
                            accept=".pdf"
                            style={{ display: "none" }}
                            onChange={(e) => setArchivo(e.target.files[0])}
                        />
                    </label>
                </div>

                <button
                    className="btn-aprobar"
                    onClick={subirCv}
                    disabled={loading || !archivo}
                    style={{ marginTop: "1rem" }}
                >
                    {loading ? "Subiendo…" : "Subir CV"}
                </button>
            </div>

            {tieneCv && (
                <div className="cv-ver">
                    <p style={{ marginBottom: "0.5rem", color: "#555" }}>
                        Ya tenés un CV subido.
                    </p>
                    <a
                        href={`${API}/oferente/cv/${id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ver-cv"
                    >
                        Ver mi CV actual
                    </a>
                </div>
            )}
        </div>
    );
}

/* ─── Dashboard principal ────────────────────────────────────────────────── */
export default function DashboardOferente({ onLogout }) {
    const nombre = localStorage.getItem("nombre") || "Oferente";
    const [vista, setVista] = useState("puestos");

    const navLinks = [
        { key: "puestos",     label: "Puestos disponibles" },
        { key: "habilidades", label: "Mis habilidades"     },
        { key: "cv",          label: "Mi CV"               },
    ];

    return (
        <div className="dashboard-wrapper">
            <nav className="dash-nav">
                <span className="dash-brand">BolsaEmpleo — Oferente</span>
                <div className="dash-nav-links">
                    {navLinks.map((l) => (
                        <button
                            key={l.key}
                            className={vista === l.key ? "active" : ""}
                            onClick={() => setVista(l.key)}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
                <div className="dash-nav-right">
                    <span className="dash-user">{nombre}</span>
                    <button className="btn-logout" onClick={onLogout}>Cerrar sesión</button>
                </div>
            </nav>

            <main className="dash-main">
                {vista === "puestos"     && <SeccionPuestos />}
                {vista === "habilidades" && <SeccionHabilidades />}
                {vista === "cv"          && <SeccionCV />}
            </main>
        </div>
    );
}