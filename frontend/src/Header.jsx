import "./App.css";

export default function Header({ navActivo, onNavClick }) {
    const navLinks = [
        { key: "inicio",    label: "BolsaEmpleo" },
        { key: "buscar",    label: "Buscar" },
        { key: "empresa",   label: "Empresa" },
        { key: "oferente",  label: "Oferente" },
        { key: "login",     label: "Login" },
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
                </nav>
            </div>
            <div className="header-divider" />
        </header>
    );
}