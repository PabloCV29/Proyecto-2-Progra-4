import { useState, useEffect, useCallback } from "react";
import { useApp } from "../AppProvider";
import "./DashboardEmpresa.css";

const API_BASE = "/api";

function fetchAuth(url, options = {}) {
    const token = localStorage.getItem("token");
    return fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
}

function PuestoEmpresaCard({ puesto, onToggleEstado, onBuscarCandidatos }) {
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
                className="emp-btn emp-btn--primario"
                onClick={() => {
                    console.log("CLICK", puesto);
                    onBuscarCandidatos(puesto);
                }}
            >
                Buscar candidatos
            </button>
            <button
                className={`emp-btn ${puesto.activo ? "emp-btn--secundario" : "emp-btn--primario"}`}
                onClick={() => onToggleEstado(puesto)}
            >
                {puesto.activo ? "Desactivar" : "Activar"}
            </button>
        </div>
    );
}

function CandidatosPuesto({ puesto, candidatos ,onVolver, onVerDetalle }) {
    return (
        <div className="emp-seccion">
            <h2 className="emp-seccion__titulo">
                Candidatos para el puesto
            </h2>
            <p className="emp-candidatos-puesto">
                <strong>Puesto:</strong> {puesto.descripcion}
            </p>
            <table className="emp-tabla">
                <thead>
                <tr>
                    <th>Oferente</th>
                    <th>Requisitos cumplidos</th>
                    <th>% Coincidencia</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {candidatos.map(c => (
                    <tr key={c.identificacion}>
                        <td>{c.nombre}</td>
                        <td>
                            {c.requisitosCumplidos}
                            /
                            {c.totalRequisitos}
                        </td>
                        <td>
                            {c.porcentaje.toFixed(2)}%
                        </td>
                        <td>
                            <button
                                className="emp-btn emp-btn--primario"
                                onClick={() =>
                                    onVerDetalle(c.identificacion)
                                }
                            >
                                Ver detalle
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button
                className="emp-btn emp-btn--secundario"
                onClick={onVolver}
            >
                Volver
            </button>
        </div>
    );
}

function DetalleOferente({ oferente, onVolver }) {
    return (
        <div className="emp-seccion">
            <h2 className="emp-seccion__titulo">
                Detalle de oferente
            </h2>
            <div className="emp-detalle-card">
                <h3>{oferente.nombre} {oferente.apellido}</h3>
                <p>
                    <strong>Identificación:</strong>
                    {" "}
                    {oferente.identificacion}
                </p>
                <p>
                    <strong>Email:</strong>
                    {" "}
                    {oferente.correo}
                </p>
                <p>
                    <strong>Teléfono:</strong>
                    {" "}
                    {oferente.telefono}
                </p>
                <p>
                    <strong>Residencia:</strong>
                    {" "}
                    {oferente.residencia}
                </p>
            </div>
            <h3 className="emp-subtitulo">
                Habilidades
            </h3>
            <table className="emp-tabla">
                <thead>
                <tr>
                    <th>Característica</th>
                    <th>Nivel</th>
                </tr>
                </thead>
                <tbody>
                {oferente.habilidades?.map(h => (
                    <tr key={h.id}>
                        <td>
                            {h.caracteristica?.nombre}
                        </td>
                        <td>
                            {h.nivel}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button
                className="emp-btn emp-btn--secundario"
                onClick={onVolver}
            >
                Volver
            </button>
        </div>
    );
}

// ── Vista: Mis Puestos ────────────────────────────────────────────────────────
function MisPuestos({ correo, onBuscarCandidatos }) {
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

    useEffect(() => {cargarPuestos();}, [cargarPuestos]);


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
    console.log("onBuscarCandidatos recibido:", onBuscarCandidatos);
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
                    <PuestoEmpresaCard key={p.id}
                                       puesto={p}
                                       onToggleEstado={handleToggle}
                                       onBuscarCandidatos={onBuscarCandidatos}
                    />
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

    const [raices, setRaices] = useState([]);
    const [actualId, setActualId] = useState(null);
    const [hijos, setHijos] = useState([]);

    const [nivelCaracteristica, setNivelCaracteristica] = useState(1);
    const [caracteristicaId, setCaracteristicaId] = useState("");

    const [caracteristicasPuesto, setCaracteristicasPuesto] = useState([]);

    useEffect(() => {
        fetch("/api/caracteristicas/raices")
            .then(r => r.json())
            .then(setRaices);
    }, []);

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

    const agregarCaracteristica = () => {
        if (!caracteristicaId)
            return;
        const existe =
            caracteristicasPuesto.some(
                c => c.caracteristicaId === Number(caracteristicaId)
            );
        if (existe) {
            setMensaje({
                tipo: "error",
                texto: "La característica ya fue agregada."
            });
            return;
        }
        let nombre = "";
        hijos.forEach(h => {
            if (h.id === Number(caracteristicaId))
                nombre = h.nombre;
        });
        setCaracteristicasPuesto(prev => [
            ...prev,
            {
                caracteristicaId: Number(caracteristicaId),
                nombre,
                nivel: nivelCaracteristica
            }
        ]);
        setCaracteristicaId("");
    };

    const eliminarCaracteristica = (id) => {
        setCaracteristicasPuesto(prev =>
            prev.filter(c => c.caracteristicaId !== id)
        );
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (caracteristicasPuesto.length === 0) {
            setMensaje({
                tipo: "error",
                texto: "Debe agregar al menos una caracteristica."
            });
            return;
        }
        setLoading(true);
        setMensaje(null);
        try {
            const body = {
                descripcion: form.descripcion,
                salario: parseFloat(form.salario),
                publico: form.publico,
                empresaCorreo: correo,
                caracteristicas:
                    caracteristicasPuesto.map(c => ({
                        caracteristicaId: c.caracteristicaId,
                        nivel: c.nivel
                    }))
            };
            const res  = await fetchAuth(`${API_BASE}/empresa/puestos`, {
                method: "POST",
                body:   JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                setMensaje({ tipo: "exito", texto: "Puesto publicado correctamente." });
                setForm({ descripcion: "", salario: "", publico: true });
                setCaracteristicasPuesto([]);
                setCaracteristicaId("");
                setNivelCaracteristica(1);
                setActualId(null);
                setHijos([]);
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
                <hr className="emp-separador" />
                <h3 className="emp-subtitulo">
                    Características requeridas
                </h3>
                {caracteristicasPuesto.length > 0 && (
                    <table className="emp-tabla">
                        <thead>
                        <tr>
                            <th>Característica</th>
                            <th>Nivel</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {caracteristicasPuesto.map((c) => (
                            <tr key={c.caracteristicaId}>
                                <td>{c.nombre}</td>
                                <td>
                                    {"★".repeat(c.nivel)}
                                    {"☆".repeat(5 - c.nivel)}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="emp-btn-eliminar"
                                        onClick={() =>
                                            eliminarCaracteristica(
                                                c.caracteristicaId
                                            )
                                        }
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                <div className="emp-arbol">
                    {actualId === null ? (
                        <>
                            <p className="emp-arbol__label">
                                Seleccione una categoría:
                            </p>
                            {raices.map((r) => (
                                <button
                                    type="button"
                                    key={r.id}
                                    className="emp-arbol__nodo"
                                    onClick={() => entrarEnNodo(r)}
                                >
                                    {r.nombre} ▸
                                </button>
                            ))}
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="emp-arbol__volver"
                                onClick={volverARaices}
                            >
                                ← Volver a categorías
                            </button>
                            <p className="emp-arbol__label">
                                Seleccione una subcategoría:
                            </p>
                            {hijos.length === 0 && (
                                <p className="emp-estado">
                                    No hay subcategorías.
                                </p>
                            )}
                            {hijos.map((h) => (
                                <button
                                    type="button"
                                    key={h.id}
                                    className={`emp-arbol__nodo ${
                                        caracteristicaId == h.id
                                            ? "emp-arbol__nodo--activo"
                                            : ""
                                    }`}
                                    onClick={() => {

                                        if (h.hijos?.length > 0) {
                                            entrarEnNodo(h);
                                        } else {
                                            setCaracteristicaId(
                                                String(h.id)
                                            );
                                        }
                                    }}
                                >
                                    {h.nombre}
                                    {h.hijos?.length > 0 ? " ▸" : ""}
                                </button>
                            ))}
                        </>
                    )}
                </div>
                <div className="emp-caracteristica-form">
                    <label>
                        Característica seleccionada
                    </label>
                    <span className="emp-caracteristica-sel">
                        {caracteristicaId
                            ? (
                                hijos.find(
                                    h =>
                                        h.id ==
                                        caracteristicaId
                                )?.nombre
                                ?? "Seleccionada"
                            )
                            : "Ninguna"}
                    </span>
                    <label>
                        Nivel requerido
                    </label>
                    <div className="emp-estrellas">
                        {[1,2,3,4,5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                className={`emp-estrella ${
                                    nivelCaracteristica >= n
                                        ? "emp-estrella--activa"
                                        : ""
                                }`}
                                onClick={() =>
                                    setNivelCaracteristica(n)
                                }
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="emp-btn emp-btn--primario"
                        disabled={!caracteristicaId}
                        onClick={agregarCaracteristica}
                    >
                        Agregar característica
                    </button>
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
    const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
    const [candidatos,setCandidatos] = useState([]);

    const { usuario } = useApp();
    const correo = usuario?.id ?? "";

    const [vistaActiva, setVistaActiva] = useState("inicio");

    const [oferenteSeleccionado, setOferenteSeleccionado] = useState(null);

    const cargarDetalleOferente = async (idOferente) => {

        const res = await fetchAuth(
            `/api/empresa/oferentes/${idOferente}`
        );
        if (!res.ok)
            return;
        const data = await res.json();
        setOferenteSeleccionado(data);
        setVistaActiva("detalleOferente");
    };

    const navLinks = [
        { key: "inicio",          label: "Dashboard" },
        { key: "misPuestos",      label: "Mis puestos" },
        { key: "publicarPuesto",  label: "Publicar puesto" },
    ];

    const cargarCandidatos = async (puesto) => {

        const res = await fetchAuth(
            `/api/empresa/puestos/${puesto.id}/candidatos`
        );

        if(!res.ok)
            return;

        const data = await res.json();

        setPuestoSeleccionado(puesto);
        setCandidatos(data);

        setVistaActiva("candidatos");
    };

    const renderVista = () => {
        switch (vistaActiva) {
            case "misPuestos":
                return <MisPuestos correo={correo}
                                   onBuscarCandidatos={cargarCandidatos}
                />;
            case "publicarPuesto":
                return (
                    <PublicarPuesto
                        correo={correo}
                        onPublicado={() => setVistaActiva("misPuestos")}
                    />
                );
            case "candidatos":
                return (
                    <CandidatosPuesto
                        puesto={puestoSeleccionado}
                        candidatos={candidatos}
                        onVerDetalle={cargarDetalleOferente}
                        onVolver={() =>
                            setVistaActiva("misPuestos")}
                    />
                );
            case "detalleOferente":
                return (
                    <DetalleOferente
                        oferente={oferenteSeleccionado}
                        onVolver={() =>
                            setVistaActiva("candidatos")
                        }
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