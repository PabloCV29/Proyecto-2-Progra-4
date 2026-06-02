import { useState } from "react";

import "./registroempresa.css";

export default function RegistroEmpresa({ onCancelar }) {  // ← recibir función por prop
    const [formData, setFormData] = useState({
        nombre: "",
        correo: "",
        telefono: "",
        localizacion: "",
        clave: "",
    });
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const [loading, setLoading] = useState(false);
    const [mostrarClave, setMostrarClave] = useState(false); // ← nuevo

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: "", texto: "" });


        console.log("Enviando:", JSON.stringify(formData));

        try {
            const response = await fetch("/api/empresa/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Respuesta del servidor:", data);

            if (response.ok) {
                setMensaje({
                    tipo: "exito",
                    texto: "Registro exitoso. Esperá la aprobación del administrador.",
                });
                setFormData({
                    nombre: "",
                    correo: "",
                    telefono: "",
                    localizacion: "",
                    clave: "",
                });
            } else {
                setMensaje({ tipo: "error", texto: "Error al registrar la empresa." });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "Error al conectar con el servidor" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registro-empresa-wrapper">
            <div className="dashboard-container">
                <h1>Registro Empresa</h1>
                <p className="subtitle">Complete los datos para completar el registro</p>

                {mensaje.texto && (
                    <div className={`mensaje mensaje-${mensaje.tipo}`}>
                        {mensaje.tipo === "exito" ? "✓" : "✕"} {mensaje.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="registro-form">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre"
                               value={formData.nombre} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico</label>
                        <input type="email" id="correo" name="correo"
                               placeholder="example@corp.com"
                               value={formData.correo} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <input type="text" id="telefono" name="telefono"
                               value={formData.telefono} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="localizacion">Localización</label>
                        <input type="text" id="localizacion" name="localizacion"
                               value={formData.localizacion} onChange={handleChange} required />
                    </div>


                    <div className="form-group">
                        <label htmlFor="clave">Clave</label>
                        <div className="input-clave-wrapper">
                            <input
                                type={mostrarClave ? "text" : "password"}
                                id="clave" name="clave"
                                placeholder="**********"
                                value={formData.clave}
                                onChange={handleChange} required
                            />
                            <button
                                type="button"
                                className="btn-toggle-clave"
                                onClick={() => setMostrarClave((v) => !v)}
                                title={mostrarClave ? "Ocultar clave" : "Mostrar clave"}
                            >
                                Mostrar
                            </button>
                        </div>
                    </div>

                    <div className="actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Registrando..." : "Registrar"}
                        </button>
                        <button type="button" className="btn btn-secondary"
                                onClick={onCancelar} disabled={loading}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
            <footer className="re-footer">
                <div className="re-footer-inner">
                    <div className="re-footer-left">
                        <strong className="re-footer-marca">Bolsa de Empleo</strong>
                        <span className="re-footer-empresa">Total Soft Inc.</span>
                    </div>
                    <div className="re-footer-right">
                        <span className="re-footer-contacto">Contacto: info@bolsaempleo.local</span>
                        <span className="re-footer-creditos">
                Créditos: Mathiw Aguero, Pablo Campos, Juan Pablo Sanchez
            </span>
                    </div>
                </div>
            </footer>
        </div>

    );
}