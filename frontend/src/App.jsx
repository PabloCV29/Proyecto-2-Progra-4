import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import Registroempresa from "./pages/registroempresa.jsx"
import RegistroOferentes from "./pages/registrooferente.jsx"
import "./App.css";
import Header from "./Header";
import Login from "./pages/login.jsx";

function PuestoCard({ puesto, onVerDetalle }) {
    return (
        <div className="puesto-card">
            <span className="puesto-empresa">{puesto.nombreEmpresa}</span>
            <h3 className="puesto-nombre">{puesto.descripcion}</h3>
            <p className="puesto-salario">₡ {puesto.salario.toLocaleString()}</p>

            {/* Requisitos OCULTOS en la card */}

            <button className="btn-detalle" onClick={() => onVerDetalle(puesto.id)}>
                Ver detalle
            </button>
        </div>
    );
}

function DetalleModal({ puesto, onClose }) {
    if (!puesto) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <span className="puesto-empresa">{puesto.nombreEmpresa}</span>
                <h2 className="modal-titulo">{puesto.descripcion}</h2>
                <p className="modal-salario">₡ {puesto.salario.toLocaleString()}</p>

                <div className="modal-descripcion">
                    <h4>Descripción</h4>
                    <p>{puesto.descripcion ?? "Sin descripción disponible."}</p>
                </div>

                {/* ← AQUÍ: Características SOLO en el modal */}
                {puesto.caracteristicasPuestos && puesto.caracteristicasPuestos.length > 0 && (
                    <div className="modal-caracteristicas">
                        <h4>Requisitos</h4>
                        <ul>
                            {puesto.caracteristicasPuestos.map((car) => (
                                <li key={car.id}>
                                    <strong>{car.caracteristicas?.nombre}</strong>
                                    <span className="nivel-requerido">Nivel: {car.nivelRequerido}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button className="btn-aplicar">Aplicar ahora</button>
            </div>
        </div>
    );
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const { puestos, loading, error, puestoDetalle, fetchUltimosPuestos, fetchDetallePuesto, clearDetalle, usuario, logout } = useApp();
  const [navActivo, setNavActivo] = useState("inicio");
    const [vista, setVista] = useState("inicio");

  useEffect(() => {
    fetchUltimosPuestos();
  }, [fetchUltimosPuestos]);


    const handleNavClick = (key) => {
        setNavActivo(key);
        if (key === "empresa") setVista("registroEmpresa");
        else if (key === "oferente") setVista("registroOferente");
        else if (key === "login")    setVista("login");
        else setVista("inicio");  // ← cualquier otro link vuelve al inicio
    };

    if (vista === "registroEmpresa") {
        return (
            <div className="app-wrapper">
                <Header navActivo={navActivo} onNavClick={handleNavClick} />
                <Registroempresa onCancelar={() => { setVista("inicio"); setNavActivo("inicio"); }} />
            </div>
        );
    }

    if (vista === "registroOferente") {
        return (
            <div className="app-wrapper">
                <Header navActivo={navActivo} onNavClick={handleNavClick} />
                <RegistroOferentes onCancelar={() => { setVista("inicio"); setNavActivo("inicio"); }} />
            </div>
        );
    }

    if (vista === "login") {
        if (usuario) {
            return (
                <div className="app-wrapper">
                    <Header navActivo={navActivo} onNavClick={handleNavClick} />
                    <main className="app-main">
                        <h1 className="main-titulo">Bienvenido, {usuario.nombre || usuario.identificacion}</h1>
                        <p style={{ color: "#555", marginBottom: "1rem" }}>Rol: {usuario.rol}</p>
                        <button className="btn-aplicar" onClick={() => {
                            logout();
                            setVista("inicio");
                            setNavActivo("inicio");
                        }}>
                            Cerrar sesión
                        </button>
                    </main>
                </div>
            );
        }
        return (
            <div className="app-wrapper">
                <Header navActivo={navActivo} onNavClick={handleNavClick} />
                <Login onCancelar={() => { setVista("inicio"); setNavActivo("inicio"); }} />
            </div>
        );
    }

        return (
            <div className="app-wrapper">
                <Header navActivo={navActivo} onNavClick={handleNavClick}/>
                {/* ── MAIN ───────────────────────────────────────────────────────── */}
                <main className="app-main">
                    <h1 className="main-titulo">Bolsa de Empleo</h1>

                    {loading && <p className="estado-msg">Cargando puestos…</p>}
                    {error && <p className="estado-msg estado-msg--error">Error: {error}</p>}

                    {!loading && !error && puestos.length === 0 && (
                        <p className="estado-msg">No hay puestos disponibles en este momento.</p>
                    )}

                    <div className="puestos-grid">
                        {puestos.map((p) => (
                            <PuestoCard key={p.id} puesto={p} onVerDetalle={fetchDetallePuesto}/>
                        ))}
                    </div>
                </main>

                {/* ── FOOTER ─────────────────────────────────────────────────────── */}
                <footer className="app-footer">
                    <div className="footer-divider"/>
                    <div className="footer-inner">
                        <div className="footer-left">
                            <strong className="footer-marca">Bolsa de Empleo</strong>
                            <span className="footer-empresa">JPM S.A.</span>
                        </div>
                        <div className="footer-right">
                            <span className="footer-contacto">Contacto: info@una</span>
                            <span className="footer-creditos">Créditos: Santa Ana, Turrubares, San Francisco</span>
                        </div>
                    </div>
                </footer>

                {/* ── MODAL DETALLE ──────────────────────────────────────────────── */}
                <DetalleModal puesto={puestoDetalle} onClose={clearDetalle}/>
            </div>
        );
    }