import { useEffect, useState } from "react";
import "./dashboardAdmin.css"; // reusa estilos de nav/tabla

export default function DashboardOferente({ onLogout }) {
    const nombre = localStorage.getItem("nombre") || "Oferente";
    const [puestos, setPuestos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/puestos/ultimos")
            .then((r) => r.json())
            .then((d) => { setPuestos(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-wrapper">
            <nav className="dash-nav">
                <span className="dash-brand">BolsaEmpleo — Oferente</span>
                <div className="dash-nav-links" />
                <div className="dash-nav-right">
                    <span className="dash-user">{nombre}</span>
                    <button className="btn-logout" onClick={onLogout}>Cerrar sesión</button>
                </div>
            </nav>

            <main className="dash-main">
                <h2 className="dash-titulo">Puestos disponibles</h2>

                {loading && <p className="estado-msg">Cargando puestos…</p>}

                <div className="puestos-grid">
                    {puestos.map((p) => (
                        <div key={p.id} className="puesto-card">
                            <span className="puesto-empresa">{p.nombreEmpresa}</span>
                            <h3 className="puesto-nombre">{p.descripcion}</h3>
                            <p className="puesto-salario">₡ {p.salario.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}