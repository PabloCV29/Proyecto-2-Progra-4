import { useState, useEffect, useCallback } from "react";
import { useApp } from "../AppProvider";
import "./DashboardEmpresa.css";

const API_BASE = "/api";

// ── Utilidad fetch autenticado ────────────────────────────────────────────────
function fetchAuth(url, options = {}) {
    const token = sessionStorage.getItem("usuario")
        ? JSON.parse(sessionStorage.getItem("usuario")).token
        : null;
    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
}

// ── Tarjeta de puesto (vista empresa) ────────────────────────────────────────
function PuestoEmpresaCard({ puesto, onToggleEstado }) {
    return (
        <div className={`emp-puesto-card ${!puesto.activo ? "emp-puesto-card--inactivo" : ""}`}>
            <div className="emp-puesto-card__header">
                <h3 className="emp-puesto-card__nombre">{puesto.descripcion}</h3>
                <span className={`emp-badge ${puesto.activo ? "emp-badge--activo" : "emp-badge--inactivo"}`}>
                    {puesto.activo ? "Activo" : "Inactivo"}
                </span>
            </div>
            <p className="emp-puesto-card__salario">₡ {puesto.salario.toLocaleString()}</p>
            {puesto.caracteristicasPuestos?.length > 0 && (
                <ul className="emp-puesto-card__skills">
                    {puesto.caracteristicasPuestos.map((c) => (
                        <li key={c.id}>
                            {c.caracteristicas?.nombre}
                            <span className="emp-skill-nivel">Niv. {c.nivelRequerido}</span>
                        </li>
                    ))}
                </ul>
            )}
            <button
                className={`emp-btn ${puesto.activo ? "emp-btn--secundario" : "emp-btn--primario"}`}
                onClick={() => onToggleEstado(puesto)}
            >
                {puesto.activo ? "Desactivar" : "Activar"}
            </button>
        </div>
    );
}

// ── Vista: Mis Puestos ────────────────────────────────────────────────────────
function MisPuestos({ correo }) {
    const [puestos, setPuestos]   = useState([]);
    const [loading, setLoading]   = useState(false);
    const [mensaje, setMensaje]   = useState(null);

    const cargarPuestos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAuth(`${API_BASE}/empresa/puestos?correo=${encodeURIComponent(correo)}`);
            if (!res.ok) throw new Error("Error al cargar puestos");
            setPuestos(await res.json());
        } catch (e) {
            setMensaje({ tipo: "error", texto: e.message });
        } finally {
            setLoading(false);
        }
    }, [correo]);

    useEffect(() => { cargarPuestos(); }, [cargarPuestos]);


    const handleToggle = async (puesto) => {
        const url    = `/api/empresa/puestos/${puesto.id}/${puesto.activo ? "desactivar" : "activar"}`;
        const res    = await fetchAuth(url, { method: "PUT" });
        const data   = await res.json();
        if (res.ok) {
            setMensaje({ tipo: "exito", texto: data.mensaje });
            cargarPuestos();
        } else {
            setMensaje({ tipo: "error", texto: data.error });
        }
        setTimeout(() => setMensaje(null), 3000);
    };

    return (
        <div className="emp-seccion">
            <h2 className="emp-seccion__titulo">Mis puestos</h2>
            {mensaje && (
                <div className={`emp-mensaje emp-mensaje--${mensaje.tipo}`}>
                    {mensaje.tipo === "exito" ? "✓" : "✕"} {mensaje.texto}
                </div>
            )}
            {loading && <p className="emp-estado">Cargando puestos…</p>}
            {!loading && puestos.length === 0 && (
                <p className="emp-estado">No tenés puestos publicados aún.</p>
            )}
            <div className="emp-puestos-grid">
                {puestos.map((p) => (
                    <PuestoEmpresaCard key={p.id} puesto={p} onToggleEstado={handleToggle} />
                ))}
            </div>
        </div>
    );
}

// ── Vista: Publicar Puesto ────────────────────────────────────────────────────
function PublicarPuesto({ correo, onPublicado }) {
    const [form, setForm]       = useState({ descripcion: "", salario: "", publico: true });
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje(null);
        try {
            const body = {
                descripcion: form.descripcion,
                salario:     parseFloat(form.salario),
                publico:     form.publico,
                activo:      true,
                empresa:     { correo },
            };
            const res  = await fetchAuth(`${API_BASE}/empresa/puestos`, {
                method: "POST",
                body:   JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                setMensaje({ tipo: "exito", texto: "Puesto publicado correctamente." });
                setForm({ descripcion: "", salario: "", publico: true });
                onPublicado?.();
            } else {
                setMensaje({ tipo: "error", texto: data.error || "Error al publicar." });
            }
        } catch (_e) {
            setMensaje({ tipo: "error", texto: "Error al conectar con el servidor." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="emp-seccion">
            <h2 className="emp-seccion__titulo">Publicar nuevo puesto</h2>
            {mensaje && (
                <div className={`emp-mensaje emp-mensaje--${mensaje.tipo}`}>
                    {mensaje.tipo === "exito" ? "✓" : "✕"} {mensaje.texto}
                </div>
            )}
            <form className="emp-form" onSubmit={handleSubmit}>
                <div className="emp-form__grupo">
                    <label htmlFor="descripcion">Descripción del puesto</label>
                    <input
                        id="descripcion" name="descripcion" type="text"
                        value={form.descripcion} onChange={handleChange}
                        placeholder="Ej: Desarrollador Backend Java"
                        required
                    />
                </div>
                <div className="emp-form__grupo">
                    <label htmlFor="salario">Salario (₡)</label>
                    <input
                        id="salario" name="salario" type="number" min="0"
                        value={form.salario} onChange={handleChange}
                        placeholder="Ej: 1200000"
                        required
                    />
                </div>
                <div className="emp-form__grupo emp-form__grupo--check">
                    <input
                        id="publico" name="publico" type="checkbox"
                        checked={form.publico} onChange={handleChange}
                    />
                    <label htmlFor="publico">Visible públicamente</label>
                </div>
                <button type="submit" className="emp-btn emp-btn--primario" disabled={loading}>
                    {loading ? "Publicando…" : "Publicar puesto"}
                </button>
            </form>
        </div>
    );
}

// ── Dashboard principal ───────────────────────────────────────────────────────
export default function DashboardEmpresa({ onLogout }) {
    const { usuario } = useApp();
    const correo      = usuario?.correo ?? "";
    const nombre      = usuario?.nombre ?? "Empresa";

    const [vistaActiva, setVistaActiva] = useState("inicio");

    const navLinks = [
        { key: "inicio",          label: "Dashboard" },
        { key: "misPuestos",      label: "Mis puestos" },
        { key: "publicarPuesto",  label: "Publicar puesto" },
    ];

    const renderVista = () => {
        switch (vistaActiva) {
            case "misPuestos":
                return <MisPuestos correo={correo} />;
            case "publicarPuesto":
                return (
                    <PublicarPuesto
                        correo={correo}
                        onPublicado={() => setVistaActiva("misPuestos")}
                    />
                );
            default:
                return (
                    <div className="emp-bienvenida">
                        <h1 className="emp-bienvenida__titulo">Empresa — Dashboard</h1>
                        <p className="emp-bienvenida__sub">
                            Desde aquí podés administrar tus puestos y buscar candidatos.
                        </p>
                        <div className="emp-bienvenida__acciones">
                            <button
                                className="emp-btn emp-btn--primario"
                                onClick={() => setVistaActiva("misPuestos")}
                            >
                                Ver mis puestos
                            </button>
                            <button
                                className="emp-btn emp-btn--primario"
                                onClick={() => setVistaActiva("publicarPuesto")}
                            >
                                Publicar nuevo puesto
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="emp-wrapper">

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <header className="emp-header">
                <div className="emp-header__inner">
                    <div className="emp-header__logo">
                        <div className="emp-logo-circle">
                            <span className="emp-logo-top">OFERTAS</span>
                            <span className="emp-logo-icon">👥</span>
                            <span className="emp-logo-bot">DE EMPLEO</span>
                        </div>
                        <span className="emp-header__marca">BolsaEmpleo</span>
                    </div>
                    <nav className="emp-nav">
                        {navLinks.map((l) => (
                            <button
                                key={l.key}
                                className={`emp-nav__link ${vistaActiva === l.key ? "emp-nav__link--activo" : ""}`}
                                onClick={() => setVistaActiva(l.key)}
                            >
                                {l.label}
                            </button>
                        ))}
                    </nav>
                    <div className="emp-header__usuario">
                        <span className="emp-header__correo">{correo}</span>
                        <button className="emp-btn-salir" onClick={onLogout}>Salir</button>
                    </div>
                </div>
                <div className="emp-header__divider" />
            </header>

            {/* ── CONTENIDO ──────────────────────────────────────────────── */}
            <main className="emp-main">
                {renderVista()}
            </main>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <footer className="emp-footer">
                <div className="emp-footer__divider" />
                <div className="emp-footer__inner">
                    <div className="emp-footer__izq">
                        <strong className="emp-footer__marca">Bolsa de Empleo</strong>
                        <span className="emp-footer__empresa">JPM S.A.</span>
                    </div>
                    <div className="emp-footer__der">
                        <span>Contacto: info@una</span>
                        <span>Créditos: Santa Ana, Turrubares, San Francisco</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}