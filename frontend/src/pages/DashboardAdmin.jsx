import { useState } from "react";
import { usePendientes } from "../hooks/usePendientes";
import "./dashboardAdmin.css";

export default function DashboardAdmin({ onLogout }) {
    const nombre = localStorage.getItem("nombre") || "Administrador";
    const [vista, setVista] = useState("inicio");
    const [mensaje, setMensaje] = useState("");

    const { empresasPendientes, oferentesPendientes, stats, refetch } = usePendientes();

    const aprobarEmpresa = async (correo) => {
        const token = localStorage.getItem("token");
        const authHeaders = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        await fetch(`/api/admin/empresas-pendientes/aprobar?correo=${correo}`, {
            method: "POST",
            headers: authHeaders,
        });
        setMensaje("Empresa aprobada");
        refetch();
    };

    const aprobarOferente = async (identificacion) => {
        const token = localStorage.getItem("token");
        const authHeaders = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
        await fetch(`/api/admin/oferentes-pendientes/aprobar?identificacion=${identificacion}`, {
            method: "POST",
            headers: authHeaders,
        });
        setMensaje("Oferente aprobado");
        refetch();
    };

    return (
        <div className="dashboard-wrapper">
            <nav className="dash-nav">
                <span className="dash-brand">BolsaEmpleo — Admin</span>
                <div className="dash-nav-links">
                    <button className={vista === "inicio" ? "active" : ""} onClick={() => setVista("inicio")}>Inicio</button>
                    <button className={vista === "empresas" ? "active" : ""} onClick={() => setVista("empresas")}>
                        Empresas {stats.empresasPendientes > 0 && <span className="badge">{stats.empresasPendientes}</span>}
                    </button>
                    <button className={vista === "oferentes" ? "active" : ""} onClick={() => setVista("oferentes")}>
                        Oferentes {stats.oferentesPendientes > 0 && <span className="badge">{stats.oferentesPendientes}</span>}
                    </button>
                </div>
                <div className="dash-nav-right">
                    <span className="dash-user">{nombre}</span>
                    <button className="btn-logout" onClick={onLogout}>Cerrar sesión</button>
                </div>
            </nav>

            <main className="dash-main">
                {mensaje && <div className="dash-mensaje">{mensaje}</div>}

                {vista === "inicio" && (
                    <div className="dash-cards">
                        <div className="stat-card" onClick={() => setVista("empresas")}>
                            <span className="stat-num">{stats.empresasPendientes}</span>
                            <span className="stat-label">Empresas pendientes</span>
                        </div>
                        <div className="stat-card" onClick={() => setVista("oferentes")}>
                            <span className="stat-num">{stats.oferentesPendientes}</span>
                            <span className="stat-label">Oferentes pendientes</span>
                        </div>
                    </div>
                )}

                {vista === "empresas" && (
                    <div>
                        <h2 className="dash-titulo">Empresas pendientes de aprobación</h2>
                        {empresasPendientes.length === 0
                            ? <p className="estado-msg">No hay empresas pendientes.</p>
                            : (
                                <table className="dash-table">
                                    <thead><tr><th>Correo</th><th>Nombre</th><th>Teléfono</th><th>Acción</th></tr></thead>
                                    <tbody>
                                    {empresasPendientes.map((e) => (
                                        <tr key={e.correo}>
                                            <td>{e.correo}</td>
                                            <td>{e.nombre}</td>
                                            <td>{e.telefono}</td>
                                            <td><button className="btn-aprobar" onClick={() => aprobarEmpresa(e.correo)}>Aprobar</button></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                    </div>
                )}

                {vista === "oferentes" && (
                    <div>
                        <h2 className="dash-titulo">Oferentes pendientes de aprobación</h2>
                        {oferentesPendientes.length === 0
                            ? <p className="estado-msg">No hay oferentes pendientes.</p>
                            : (
                                <table className="dash-table">
                                    <thead><tr><th>Identificación</th><th>Nombre</th><th>Correo</th><th>Acción</th></tr></thead>
                                    <tbody>
                                    {oferentesPendientes.map((o) => (
                                        <tr key={o.identificacion}>
                                            <td>{o.identificacion}</td>
                                            <td>{o.nombre} {o.apellido}</td>
                                            <td>{o.correo}</td>
                                            <td><button className="btn-aprobar" onClick={() => aprobarOferente(o.identificacion)}>Aprobar</button></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                    </div>
                )}
            </main>
        </div>
    );
}