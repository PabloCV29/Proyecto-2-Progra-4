import "./App.css";
import { useApp } from "./AppProvider";

export default function Header({ navActivo, onNavClick }) {
    const { usuario, logout } = useApp();

    const navLinks = [
        { key: "inicio",   label: "BolsaEmpleo" },
        { key: "buscar",   label: "Buscar" },
        { key: "empresa",  label: "Empresa" },
        { key: "oferente", label: "Oferente" },
    ];

    return (
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
                            onClick={() => onNavClick(link.key)}
                        >
                            {link.label}
                        </button>
                    ))}

                    {/* Si no hay sesión, mostrar Login */}
                    {!usuario && (
                        <button
                            className={`nav-link ${navActivo === "login" ? "nav-link--active" : ""}`}
                            onClick={() => onNavClick("login")}
                        >
                            Login
                        </button>
                    )}

                    {/* Si hay sesión, mostrar nombre + cerrar sesión */}
                    {usuario && (
                        <>
                            <span style={{ fontSize: "14px", color: "#555", alignSelf: "center" }}>
                                Hola, {usuario.nombre}
                            </span>
                            <button className="nav-link" onClick={() => onNavClick("logout")}>
                                Cerrar sesión
                            </button>
                        </>
                    )}
                </nav>
            </div>
            <div className="header-divider" />
        </header>
    );
}