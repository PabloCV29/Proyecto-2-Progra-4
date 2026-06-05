import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import "./App.css";
import Header from "./Header";
import Registroempresa from "./pages/registroempresa.jsx";
import RegistroOferentes from "./pages/registrooferente.jsx";
import Login from "./pages/Login.jsx";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import DashboardOferente from "./pages/DashboardOferente.jsx";
import DashboardEmpresa from "./pages/DashboardEmpresa.jsx";
import BuscarPuestos from "./pages/buscarpuestos.jsx";

function PuestoCard({ puesto, onVerDetalle }) {
    return (
        <div className="puesto-card">
            <span className="puesto-empresa">{puesto.nombreEmpresa}</span>
            <h3 className="puesto-nombre">{puesto.descripcion}</h3>
            <p className="puesto-salario">₡ {puesto.salario.toLocaleString()}</p>
            <button className="btn-detalle" onClick={() => onVerDetalle(puesto.id)}>Ver detalle</button>
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
                {puesto.caracteristicasPuestos?.length > 0 && (
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
            </div>
        </div>
    );
}

const getVistaInicial = () => {
    const rol   = localStorage.getItem("rol");
    const token = localStorage.getItem("token");
    if (!token || !rol) return "inicio";
    if (rol === "ADM") return "dashboardAdmin";
    if (rol === "EMP") return "dashboardEmpresa";
    if (rol === "OFE") return "dashboardOferente";
    return "inicio";
};

export default function App() {
    const {
        puestos, loading, error,
        puestoDetalle, fetchUltimosPuestos, fetchDetallePuesto, clearDetalle,
        logout,
    } = useApp();

    const [navActivo, setNavActivo] = useState("inicio");
    const [vista, setVista]         = useState(getVistaInicial);

    useEffect(() => {
        if (vista === "inicio") fetchUltimosPuestos();
    }, []);

    const redirigirPorRol = (rol) => {
        if (rol === "ADM") setVista("dashboardAdmin");
        else if (rol === "EMP") setVista("dashboardEmpresa");
        else if (rol === "OFE") setVista("dashboardOferente");
    };

    const handleLogout = () => {
        logout();
        setVista("inicio");
        setNavActivo("inicio");
        fetchUltimosPuestos();
    };

    const handleNavClick = (key) => {
        setNavActivo(key);
        if (key === "empresa")       setVista("registroEmpresa");
        else if (key === "oferente") setVista("registroOferente");
        else if (key === "login")    setVista("login");
        else if (key === "buscar")   setVista("buscarPuestos");
        else if (key === "logout") { handleLogout(); }
        else { setVista("inicio"); fetchUltimosPuestos(); }
    };

    // ── Dashboards (sin Header) ───────────────────────────────────────────────
    if (vista === "dashboardAdmin")    return <DashboardAdmin    onLogout={handleLogout} />;
    if (vista === "dashboardOferente") return <DashboardOferente onLogout={handleLogout} />;
    if (vista === "dashboardEmpresa")  return <DashboardEmpresa  onLogout={handleLogout} />;

    // ── Registro Empresa ──────────────────────────────────────────────────────
    if (vista === "registroEmpresa") return (
        <div className="app-wrapper">
            <Header navActivo={navActivo} onNavClick={handleNavClick} />
            <Registroempresa onCancelar={() => { setVista("inicio"); setNavActivo("inicio"); }} />
        </div>
    );

    // ── Registro Oferente ─────────────────────────────────────────────────────
    if (vista === "registroOferente") return (
        <div className="app-wrapper">
            <Header navActivo={navActivo} onNavClick={handleNavClick} />
            <RegistroOferentes onCancelar={() => { setVista("inicio"); setNavActivo("inicio"); }} />
        </div>
    );

    // ── Login ─────────────────────────────────────────────────────────────────
    if (vista === "login") return (
        <div className="app-wrapper">
            <Header navActivo={navActivo} onNavClick={handleNavClick} />
            <Login
                onCancelar={() => { setVista("inicio"); setNavActivo("inicio"); }}
                onLoginExitoso={(rol) => redirigirPorRol(rol)}
            />
        </div>
    );
    // ── Buscar Puestos ────────────────────────────────────────────────────────
    if (vista === "buscarPuestos") return (
        <div className="app-wrapper">
            <Header navActivo={navActivo} onNavClick={handleNavClick} />
            <BuscarPuestos />
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
        </div>
    );

    // ── Inicio ────────────────────────────────────────────────────────────────
    return (
        <div className="app-wrapper">
            <Header navActivo={navActivo} onNavClick={handleNavClick} />
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
            <DetalleModal puesto={puestoDetalle} onClose={clearDetalle} />
        </div>
    );
}