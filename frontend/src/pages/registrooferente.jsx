import { useState } from "react";
import "./registrooferente.css";

export default function RegistroOferente({ onCancelar }) {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        identificacion: "",
        correo: "",
        nacionalidad: "",
        residencia: "",
        telefono: "",
        clave: "",
    });
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: "", texto: "" });

        try {
            const response = await fetch("/api/oferente/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({
                    tipo: "exito",
                    texto: "Registro exitoso. Esperá la aprobación del administrador.",
                });
                setFormData({
                    nombre: "", apellido: "", identificacion: "",
                    correo: "", nacionalidad: "", residencia: "",
                    telefono: "", clave: "",
                });
            } else {
                setMensaje({
                    tipo: "error",
                    texto: data.error || "Error en el registro",
                });
            }
        } catch (error) {
            setMensaje({ tipo: "error", texto: "Error al conectar con el servidor" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registro-oferente-wrapper">
            <div className="dashboard-container">
                <h1>Registro Oferente</h1>
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
                        <label htmlFor="apellido">Apellido</label>
                        <input type="text" id="apellido" name="apellido"
                               value={formData.apellido} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="identificacion">Identificación</label>
                        <input type="text" id="identificacion" name="identificacion"
                               value={formData.identificacion} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="correo">Correo Electrónico</label>
                        <input type="email" id="correo" name="correo"
                               placeholder="example@ofe.com"
                               value={formData.correo} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="nacionalidad">Nacionalidad</label>
                        <input type="text" id="nacionalidad" name="nacionalidad"
                               value={formData.nacionalidad} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="residencia">Residencia</label>
                        <input type="text" id="residencia" name="residencia"
                               value={formData.residencia} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono</label>
                        <input type="text" id="telefono" name="telefono"
                               value={formData.telefono} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="clave">Clave</label>
                        <input type="password" id="clave" name="clave"
                               placeholder="*******"
                               value={formData.clave} onChange={handleChange} required />
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
            <footer className="ro-footer">
                <div className="ro-footer-inner">
                    <div className="ro-footer-left">
                        <strong className="ro-footer-marca">Bolsa de Empleo</strong>
                        <span className="ro-footer-empresa">Total Soft Inc.</span>
                    </div>
                    <div className="ro-footer-right">
                        <span className="ro-footer-contacto">Contacto: info@bolsaempleo.local</span>
                        <span className="ro-footer-creditos">
                            Créditos: Mathiw Aguero, Pablo Campos, Juan Pablo Sanchez
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}