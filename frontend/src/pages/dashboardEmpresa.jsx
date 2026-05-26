import { useState, useEffect } from "react";
import { useApp } from "../AppProvider";
import "./dashboardEmpresa.css";

export default function DashboardEmpresa({ onCancelar }) {
    const { usuario } = useApp();
    const [puestos, setPuestos]   = useState([]);
    const [loading, setLoading]   = useState(false);
    const [mensaje, setMensaje]   = useState({ tipo: "", texto: "" });

    const cargarPuestos = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`/api/empresa/puestos?correo=${usuario.correo}`);
            const data = await res.json();
            setPuestos(data);
        } catch {
            setMensaje({ tipo: "error", texto: "Error al cargar puestos" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!usuario?.correo) return;

        const fetchPuestos = async () => {
            setLoading(true);
            try {
                const res  = await fetch(`/api/empresa/puestos?correo=${usuario.correo}`);
                const data = await res.json();
                setPuestos(data);
            } catch {
                setMensaje({ tipo: "error", texto: "Error al cargar puestos" });
            } finally {
                setLoading(false);
            }
        };

        fetchPuestos();
    }, [usuario?.correo]);

    const handleDesactivar = async (id) => {
        if (!window.confirm("¿Desactivar este puesto?")) return;
        try {
            const res  = await fetch(`/api/empresa/puestos/${id}/desactivar`, { method: "PUT" });
            const data = await res.json();
            if (res.ok) {
                setMensaje({ tipo: "exito", texto: data.mensaje });
                cargarPuestos();
            } else {
                setMensaje({ tipo: "error", texto: data.error });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "Error al desactivar" });
        }
    };

    const handleActivar = async (id) => {
        if (!window.confirm("¿Activar este puesto?")) return;
        try {
            const res  = await fetch(`/api/empresa/puestos/${id}/activar`, { method: "PUT" });
            const data = await res.json();
            if (res.ok) {
                setMensaje({ tipo: "exito", texto: data.mensaje });
                cargarPuestos();
            } else {
                setMensaje({ tipo: "error", texto: data.error });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "Error al activar" });
        }
    };

    return (
        <div className="dashboard-empresa-wrapper">
            <div className="dashboard-empresa-container">
                <h1>Dashboard Empresa</h1>
                <p className="subtitle">Bienvenido, {usuario?.nombre}</p>

                {mensaje.texto && (
                    <div className={`mensaje mensaje-${mensaje.tipo}`}>
                        {mensaje.tipo === "exito" ? "✓" : "✕"} {mensaje.texto}
                    </div>
                )}

                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <button className="btn btn-secondary" onClick={() => setMensaje({ tipo: "", texto: "" })}>
                        Publicar nuevo puesto
                    </button>
                    <button className="btn btn-primary" onClick={onCancelar}>
                        Cerrar sesión
                    </button>
                </div>

                {loading && <p>Cargando puestos...</p>}

                <table className="tabla-puestos">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Salario</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {puestos.length === 0 && !loading && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", color: "#999" }}>
                                No hay puestos registrados.
                            </td>
                        </tr>
                    )}
                    {puestos.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.descripcion}</td>
                            <td>₡ {p.salario?.toLocaleString()}</td>
                            <td>
                                    <span className={`badge ${p.activo ? "badge-activo" : "badge-inactivo"}`}>
                                        {p.activo ? "Activo" : "Inactivo"}
                                    </span>
                            </td>
                            <td className="acciones">
                                {p.activo ? (
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleDesactivar(p.id)}
                                    >
                                        Desactivar
                                    </button>
                                ) : (
                                    <button
                                        className="btn-activar"
                                        onClick={() => handleActivar(p.id)}
                                    >
                                        Activar
                                    </button>
                                )}
                                <button className="btn-candidatos">
                                    Candidatos
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <footer className="de-footer">
                <strong>Bolsa de Empleo</strong> — Total Soft Inc.
            </footer>
        </div>
    );
}