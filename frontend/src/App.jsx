import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import registroempresa from "./pages/registroempresa.jsx"
import "./App.css";


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
  const { puestos, loading, error, puestoDetalle, fetchUltimosPuestos, fetchDetallePuesto, clearDetalle } = useApp();
  const [navActivo, setNavActivo] = useState("inicio");

  useEffect(() => {
    fetchUltimosPuestos();
  }, [fetchUltimosPuestos]);

  const navLinks = [
    { key: "inicio",    label: "BolsaEmpleo" },
    { key: "buscar",    label: "Buscar" },
      { key: "empresa", label: "Empresa", accion: () => setVista("registroEmpresa") },
    { key: "oferente",  label: "Oferente" },
    { key: "login",     label: "Login" },
  ];

  return (
      <div className="app-wrapper">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header className="app-header">
          <div className="header-inner">
            <div className="logo-area">
              <div className="logo-circle">
                <span className="logo-text-top">OFERTAS</span>
                <span className="logo-icon">👥</span>
                <span className="logo-text-bot">DE EMPLEO</span>
              </div>
            </div>
            <nav className="main-nav">
              {navLinks.map((link) => (
                  <button
                      key={link.key}
                      className={`nav-link ${navActivo === link.key ? "nav-link--active" : ""}`}
                      onClick={() => setNavActivo(link.key)}
                  >
                    {link.label}
                  </button>
              ))}
            </nav>
          </div>
          <div className="header-divider" />
        </header>

        {/* ── MAIN ───────────────────────────────────────────────────────── */}
        <main className="app-main">
          <h1 className="main-titulo">Bolsa de Empleo</h1>

          {loading && <p className="estado-msg">Cargando puestos…</p>}
          {error   && <p className="estado-msg estado-msg--error">Error: {error}</p>}

          {!loading && !error && puestos.length === 0 && (
              <p className="estado-msg">No hay puestos disponibles en este momento.</p>
          )}

          <div className="puestos-grid">
            {puestos.map((p) => (
                <PuestoCard key={p.id} puesto={p} onVerDetalle={fetchDetallePuesto} />
            ))}
          </div>
        </main>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer className="app-footer">
          <div className="footer-divider" />
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
        <DetalleModal puesto={puestoDetalle} onClose={clearDetalle} />
      </div>
  );
}