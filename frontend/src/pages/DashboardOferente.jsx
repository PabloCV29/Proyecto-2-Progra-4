import { useState, useEffect, useCallback, useRef } from "react";
import "./dashboardOferente.css";

const API = "/api";
const token = () => localStorage.getItem("token");
const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
});

function fetchAuth(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
            ...options.headers,
        },
    });
}

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
        <div className="ofe-seccion">
            <h2 className="ofe-seccion__titulo">Puestos disponibles</h2>
            {loading && <p className="ofe-estado">Cargando puestos…</p>}
            <div className="ofe-puestos-grid">
                {puestos.map((p) => (
                    <div key={p.id} className="ofe-puesto-card">
                        <div className="ofe-puesto-card__header">
                            <h3 className="ofe-puesto-card__nombre">{p.descripcion}</h3>
                        </div>
                        <p className="ofe-puesto-card__empresa">{p.nombreEmpresa}</p>
                        <p className="ofe-puesto-card__salario">
                            ₡ {p.salario.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                        </p>
                        <button className="ofe-btn ofe-btn--primario" onClick={() => verDetalle(p.id)}>
                            Ver detalle
                        </button>
                    </div>
                ))}
            </div>

            {detalle && (
                <div className="ofe-modal-overlay" onClick={() => setDetalle(null)}>
                    <div className="ofe-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button className="ofe-modal-close" onClick={() => setDetalle(null)}>✕</button>
                        <p className="ofe-modal-empresa">{detalle.nombreEmpresa}</p>
                        <h2 className="ofe-modal-titulo">{detalle.descripcion}</h2>
                        <p className="ofe-modal-salario">
                            ₡ {detalle.salario.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                        </p>
                        {detalle.caracteristicasPuestos?.length > 0 && (
                            <div className="ofe-modal-requisitos">
                                <h4>Requisitos</h4>
                                <ul>
                                    {detalle.caracteristicasPuestos.map((cp) => (
                                        <li key={cp.id}>
                                            <span>{cp.caracteristicas?.nombre ?? "—"}</span>
                                            <span className="ofe-req-nivel">Nivel {cp.nivelRequerido}</span>
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
        <div className="ofe-seccion">
            <h2 className="ofe-seccion__titulo">Mis habilidades</h2>

            {mensaje.texto && (
                <div className={`ofe-mensaje ofe-mensaje--${mensaje.tipo}`}>
                    {mensaje.tipo === "exito" ? "✓" : "✕"} {mensaje.texto}
                </div>
            )}

            <div className="ofe-habilidades-layout">
                {/* Tabla de habilidades actuales */}
                <div className="ofe-panel">
                    <h3 className="ofe-subtitulo">Habilidades registradas</h3>
                    {loading && <p className="ofe-estado">Cargando…</p>}
                    {!loading && habilidades.length === 0 && (
                        <p className="ofe-estado">No tenés habilidades registradas aún.</p>
                    )}
                    {habilidades.length > 0 && (
                        <table className="ofe-tabla">
                            <thead>
                            <tr><th>Característica</th><th>Nivel</th><th></th></tr>
                            </thead>
                            <tbody>
                            {habilidades.map((h) => (
                                <tr key={h.id}>
                                    <td>{h.nombreCaracteristica}</td>
                                    <td>
                                        <span className="ofe-nivel-badge">
                                            {"★".repeat(h.nivel)}{"☆".repeat(5 - h.nivel)}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="ofe-btn-eliminar"
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

                {/* Panel agregar habilidad */}
                <div className="ofe-panel">
                    <h3 className="ofe-subtitulo">Agregar habilidad</h3>

                    <div className="ofe-arbol">
                        {actualId === null ? (
                            <>
                                <p className="ofe-arbol__label">Seleccioná una categoría:</p>
                                {raices.map((r) => (
                                    <button
                                        key={r.id}
                                        className="ofe-arbol__nodo"
                                        onClick={() => entrarEnNodo(r)}
                                    >
                                        {r.nombre} ▸
                                    </button>
                                ))}
                            </>
                        ) : (
                            <>
                                <button className="ofe-arbol__volver" onClick={volverARaices}>
                                    ← Volver a categorías
                                </button>
                                <p className="ofe-arbol__label">Subcategorías:</p>
                                {hijos.length === 0 && (
                                    <p className="ofe-estado" style={{ fontSize: "13px" }}>
                                        No hay subcategorías.
                                    </p>
                                )}
                                {hijos.map((h) => (
                                    <button
                                        key={h.id}
                                        className={`ofe-arbol__nodo ${caracteristicaId == h.id ? "ofe-arbol__nodo--activo" : ""}`}
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

                    <div className="ofe-caracteristica-form">
                        <label>Característica seleccionada:</label>
                        <span className="ofe-caracteristica-sel">
                            {caracteristicaId
                                ? (hijos.find((h) => h.id == caracteristicaId)?.nombre ?? "Seleccionada")
                                : "Ninguna"}
                        </span>

                        <label>Nivel requerido:</label>
                        <div className="ofe-estrellas">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`ofe-estrella ${nivel >= n ? "ofe-estrella--activa" : ""}`}
                                    onClick={() => setNivel(n)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>

                        <button
                            className="ofe-btn ofe-btn--primario"
                            onClick={agregarHabilidad}
                            disabled={!caracteristicaId}
                        >
                            Agregar habilidad
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Sección: Mi CV ─────────────────────────────────────────────────────── */
function SeccionCV() {
    const fileInputRef = useRef(null);
    const id = localStorage.getItem("userId");
    const [archivo, setArchivo]   = useState(null);
    const [mensaje, setMensaje]   = useState({ tipo: "", texto: "" });
    const [loading, setLoading]   = useState(false);
    const [tieneCv, setTieneCv]   = useState(false);

    useEffect(() => {
        if (!id) return;
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
        <div className="ofe-seccion">
            <h2 className="ofe-seccion__titulo">Mi CV</h2>
            <p className="ofe-estado">Subí tu currículum en formato PDF.</p>

            {mensaje.texto && (
                <div className={`ofe-mensaje ofe-mensaje--${mensaje.tipo}`}>
                    {mensaje.tipo === "exito" ? "✓" : "✕"} {mensaje.texto}
                </div>
            )}

            <div className="ofe-cv-card">
                <div
                    className="ofe-cv-upload-area"
                    onClick={() => fileInputRef.current.click()}
                >
                    <span className="ofe-cv-icon">📄</span>
                    <span className="ofe-cv-file-label">
                        {archivo ? archivo.name : "Seleccioná tu CV (PDF)"}
                    </span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        style={{ display: "none" }}
                        onChange={(e) => setArchivo(e.target.files[0])}
                    />
                </div>

                <button
                    className="ofe-btn ofe-btn--primario"
                    onClick={subirCv}
                    disabled={loading || !archivo}
                    style={{ marginTop: "1rem" }}
                >
                    {loading ? "Subiendo…" : "Subir CV"}
                </button>
            </div>

            {tieneCv && (
                <div className="ofe-cv-ver">
                    <p style={{ marginBottom: "0.5rem", color: "#555" }}>
                        Ya tenés un CV subido.
                    </p>
                    <a
                        href={`${API}/oferente/cv/${id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ofe-btn-ver-cv"
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
    const [vistaActiva, setVistaActiva] = useState("puestos");

    const navLinks = [
        { key: "puestos",     label: "Puestos disponibles" },
        { key: "habilidades", label: "Mis habilidades"     },
        { key: "cv",          label: "Mi CV"               },
    ];

    const renderVista = () => {
        switch (vistaActiva) {
            case "habilidades": return <SeccionHabilidades />;
            case "cv":          return <SeccionCV />;
            default:            return <SeccionPuestos />;
        }
    };

    return (
        <div className="ofe-wrapper">

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <header className="ofe-header">
                <div className="ofe-header__inner">
                    <div className="ofe-header__logo">
                        <div className="ofe-logo-circle">
                            <span className="ofe-logo-top">OFERTAS</span>
                            <span className="ofe-logo-icon">👥</span>
                            <span className="ofe-logo-bot">DE EMPLEO</span>
                        </div>
                        <span className="ofe-header__marca">BolsaEmpleo</span>
                    </div>
                    <nav className="ofe-nav">
                        {navLinks.map((l) => (
                            <button
                                key={l.key}
                                className={`ofe-nav__link ${vistaActiva === l.key ? "ofe-nav__link--activo" : ""}`}
                                onClick={() => setVistaActiva(l.key)}
                            >
                                {l.label}
                            </button>
                        ))}
                    </nav>
                    <div className="ofe-header__usuario">
                        <span className="ofe-header__nombre">{nombre}</span>
                        <button className="ofe-btn-salir" onClick={onLogout}>Salir</button>
                    </div>
                </div>
                <div className="ofe-header__divider" />
            </header>

            {/* ── CONTENIDO ──────────────────────────────────────────────── */}
            <main className="ofe-main">
                {renderVista()}
            </main>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <footer className="ofe-footer">
                <div className="ofe-footer__divider" />
                <div className="ofe-footer__inner">
                    <div className="ofe-footer__izq">
                        <strong className="ofe-footer__marca">Bolsa de Empleo</strong>
                        <span className="ofe-footer__empresa">JPM S.A.</span>
                    </div>
                    <div className="ofe-footer__der">
                        <span>Contacto: info@una</span>
                        <span>Créditos: Santa Ana, Turrubares, San Francisco</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}