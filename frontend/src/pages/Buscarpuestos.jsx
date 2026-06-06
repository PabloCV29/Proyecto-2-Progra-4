import { useState, useEffect, useCallback } from "react";
import "./buscarpuestos.css";

const API_BASE = "/api";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function collectIds(nodo) {
    /* Devuelve todos los ids descendientes (inclusive el propio nodo) */
    const ids = [nodo.id];
    if (nodo.hijos) nodo.hijos.forEach((h) => ids.push(...collectIds(h)));
    return ids;
}

/* ─── sub-componentes ──────────────────────────────────────────────────────── */
function NodoCaracteristica({ nodo, seleccionados, onToggle, depth = 0 }) {
    const [expandido, setExpandido] = useState(false);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;
    const checked = seleccionados.has(nodo.id);

    return (
        <div className={`nodo depth-${depth}`}>
            <div className="nodo-fila">
                {tieneHijos && (
                    <button
                        className="expand-btn"
                        onClick={() => setExpandido((v) => !v)}
                        aria-label={expandido ? "Colapsar" : "Expandir"}
                    >
                        {expandido ? "▾" : "▸"}
                    </button>
                )}
                {!tieneHijos && <span className="expand-placeholder" />}

                <label className="nodo-label">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(nodo.id)}
                    />
                    <span>{nodo.nombre}</span>
                </label>
            </div>

            {tieneHijos && expandido && (
                <div className="nodo-hijos">
                    {nodo.hijos.map((hijo) => (
                        <NodoCaracteristica
                            key={hijo.id}
                            nodo={hijo}
                            seleccionados={seleccionados}
                            onToggle={onToggle}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function PuestoCard({ puesto, onVerDetalle }) {
    const tieneRequisitos = puesto.caracteristicasPuestos?.length > 0;

    return (
        <div className="puesto-card">
            <div className="puesto-tooltip">
                <div className="puesto-tooltip__titulo">Requisitos</div>
                {tieneRequisitos ? (
                    puesto.caracteristicasPuestos.map((cp) => (
                        <div key={cp.id} className="puesto-tooltip__item">
                            <span>{cp.caracteristicas?.nombre ?? "—"}</span>
                            <span className="puesto-tooltip__nivel">Niv. {cp.nivelRequerido}</span>
                        </div>
                    ))
                ) : (
                    <span className="puesto-tooltip__vacio">Sin requisitos definidos</span>
                )}
            </div>

            <div className="puesto-empresa">{puesto.nombreEmpresa}</div>
            <div className="puesto-descripcion">{puesto.descripcion}</div>
            <div className="puesto-salario">
                ₡ {puesto.salario.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
            </div>
            <button className="btn-ver-detalle" onClick={() => onVerDetalle(puesto)}>
                Ver detalle
            </button>
        </div>
    );
}

function DetalleModal({ puesto, onClose }) {
    if (!puesto) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <p className="modal-empresa">{puesto.nombreEmpresa}</p>
                <h2 className="modal-titulo">{puesto.descripcion}</h2>
                <p className="modal-salario">
                    ₡ {puesto.salario.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                </p>

                {puesto.caracteristicasPuestos && puesto.caracteristicasPuestos.length > 0 && (
                    <div className="modal-requisitos">
                        <h4>Requisitos</h4>
                        <ul>
                            {puesto.caracteristicasPuestos.map((cp) => (
                                <li key={cp.id}>
                                    <span className="req-nombre">
                                        {cp.caracteristicas?.nombre ?? "—"}
                                    </span>
                                    <span className="req-nivel">Nivel {cp.nivelRequerido}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── página principal ─────────────────────────────────────────────────────── */
export default function BuscarPuestos() {
    const [raices, setRaices]             = useState([]);
    const [seleccionados, setSeleccionados] = useState(new Set());
    const [puestos, setPuestos]           = useState([]);
    const [puestoDetalle, setPuestoDetalle] = useState(null);
    const [cargandoArbol, setCargandoArbol] = useState(true);
    const [cargandoPuestos, setCargandoPuestos] = useState(false);
    const [error, setError]               = useState(null);
    const [buscado, setBuscado]           = useState(false);   // ¿se hizo al menos 1 búsqueda?

    /* Carga el árbol de características al montar */
    useEffect(() => {
        fetch(`${API_BASE}/caracteristicas/raices`)
            .then((r) => {
                if (!r.ok) throw new Error(`Error ${r.status}`);
                return r.json();
            })
            .then((data) => setRaices(data))
            .catch((e) => setError(e.message))
            .finally(() => setCargandoArbol(false));
    }, []);

    /* Carga los últimos 5 puestos como estado inicial */
    useEffect(() => {
        fetch(`${API_BASE}/puestos/ultimos`)
            .then((r) => r.json())
            .then((data) => setPuestos(data))
            .catch(() => {});
    }, []);

    const toggleCaracteristica = useCallback((id) => {
        setSeleccionados((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const handleBuscar = async () => {
        setCargandoPuestos(true);
        setError(null);
        setBuscado(true);

        const ids = [...seleccionados];
        const url =
            ids.length > 0
                ? `${API_BASE}/puestos/buscar-por-caracteristicas?${ids.map((id) => `ids=${id}`).join("&")}`
                : `${API_BASE}/puestos/ultimos`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data = await res.json();
            setPuestos(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setCargandoPuestos(false);
        }
    };

    const handleLimpiar = () => {
        setSeleccionados(new Set());
        setBuscado(false);
        fetch(`${API_BASE}/puestos/ultimos`)
            .then((r) => r.json())
            .then((data) => setPuestos(data))
            .catch(() => {});
    };

    return (
        <main className="buscar-puestos-page">
            <div className="bp-layout">

                {/* ── Panel izquierdo: árbol de características ── */}
                <aside className="bp-sidebar">
                    <h2 className="sidebar-titulo">Filtrar por características</h2>

                    {cargandoArbol && <p className="estado-msg">Cargando categorías…</p>}
                    {error && !cargandoArbol && (
                        <p className="estado-msg estado-error">{error}</p>
                    )}

                    {!cargandoArbol && raices.length === 0 && (
                        <p className="estado-msg">No hay categorías disponibles.</p>
                    )}

                    <div className="arbol">
                        {raices.map((raiz) => (
                            <NodoCaracteristica
                                key={raiz.id}
                                nodo={raiz}
                                seleccionados={seleccionados}
                                onToggle={toggleCaracteristica}
                                depth={0}
                            />
                        ))}
                    </div>

                    {seleccionados.size > 0 && (
                        <p className="sel-count">
                            {seleccionados.size} característica{seleccionados.size > 1 ? "s" : ""} seleccionada{seleccionados.size > 1 ? "s" : ""}
                        </p>
                    )}

                    <div className="sidebar-acciones">
                        <button className="btn-buscar" onClick={handleBuscar} disabled={cargandoPuestos}>
                            {cargandoPuestos ? "Buscando…" : "Buscar"}
                        </button>
                        <button className="btn-limpiar" onClick={handleLimpiar}>
                            Limpiar
                        </button>
                    </div>
                </aside>

                {/* ── Panel derecho: resultados ── */}
                <section className="bp-resultados">
                    <h2 className="resultados-titulo">
                        {buscado && seleccionados.size > 0
                            ? `Resultados (${puestos.length})`
                            : "Últimos puestos publicados"}
                    </h2>

                    {cargandoPuestos && <p className="estado-msg">Buscando puestos…</p>}

                    {!cargandoPuestos && buscado && puestos.length === 0 && (
                        <p className="estado-msg">
                            No se encontraron puestos con las características seleccionadas.
                        </p>
                    )}

                    <div className="puestos-grid">
                        {puestos.map((p) => (
                            <PuestoCard
                                key={p.id}
                                puesto={p}
                                onVerDetalle={setPuestoDetalle}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <DetalleModal puesto={puestoDetalle} onClose={() => setPuestoDetalle(null)} />
        </main>
    );
}