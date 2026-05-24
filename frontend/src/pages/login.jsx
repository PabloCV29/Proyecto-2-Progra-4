import { useState } from "react";
import { useApp } from "../AppProvider";
import "./login.css";
import "../../src/pages/registroempresa.css"; // reutiliza .form-group, .btn, .mensaje

const TABS = [
    { key: "EMPRESA",  label: "Empresa" },
    { key: "OFERENTE", label: "Oferente" },
    { key: "ADMIN",    label: "Administrador" },
];

const CAMPOS = {
    EMPRESA:  [
        { name: "correo", label: "Correo",     type: "email",    placeholder: "empresa@corp.com" },
        { name: "clave",  label: "Contraseña", type: "password", placeholder: "**********" },
    ],
    OFERENTE: [
        { name: "correo", label: "Correo",     type: "email",    placeholder: "oferente@mail.com" },
        { name: "clave",  label: "Contraseña", type: "password", placeholder: "**********" },
    ],
    ADMIN: [
        { name: "identificacion", label: "Identificación", type: "text",     placeholder: "ID del administrador" },
        { name: "clave",          label: "Contraseña",     type: "password", placeholder: "**********" },
    ],
};

export default function Login({ onCancelar }) {
    const { login } = useApp();
    const [tab, setTab]       = useState("EMPRESA");
    const [form, setForm]     = useState({ correo: "", clave: "", identificacion: "" });
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const [loading, setLoading] = useState(false);
    const [mostrarClave, setMostrarClave] = useState(false);

    const handleTab = (key) => {
        setTab(key);
        setForm({ correo: "", clave: "", identificacion: "" });
        setMensaje({ tipo: "", texto: "" });
        setMostrarClave(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: "", texto: "" });

        // Armar credenciales según el rol
        const credenciales =
            tab === "ADMIN"
                ? { identificacion: form.identificacion, clave: form.clave }
                : { correo: form.correo, clave: form.clave };

        try {
            await login(tab, credenciales);
            setMensaje({ tipo: "exito", texto: "Sesión iniciada correctamente." });
        } catch (err) {
            setMensaje({ tipo: "error", texto: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h1>Iniciar Sesión</h1>

                {/* Tabs */}
                <div className="login-tabs">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            className={`login-tab ${tab === t.key ? "login-tab--active" : ""}`}
                            onClick={() => handleTab(t.key)}
                            type="button"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Mensaje */}
                {mensaje.texto && (
                    <div className={`mensaje mensaje-${mensaje.tipo}`}>
                        {mensaje.tipo === "exito" ? "✓" : "✕"} {mensaje.texto}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {CAMPOS[tab].map((campo) => (
                        <div className="form-group" key={campo.name}>
                            <label htmlFor={campo.name}>{campo.label}</label>
                            {campo.name === "clave" ? (
                                <div className="input-clave-wrapper">
                                    <input
                                        type={mostrarClave ? "text" : "password"}
                                        id="clave" name="clave"
                                        placeholder={campo.placeholder}
                                        value={form.clave}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-toggle-clave"
                                        onClick={() => setMostrarClave((v) => !v)}
                                        title={mostrarClave ? "Ocultar" : "Mostrar"}
                                    >
                                        {mostrarClave ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type={campo.type}
                                    id={campo.name}
                                    name={campo.name}
                                    placeholder={campo.placeholder}
                                    value={form[campo.name] || ""}
                                    onChange={handleChange}
                                    required
                                />
                            )}
                        </div>
                    ))}

                    <div className="actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Ingresando..." : "Ingresar"}
                        </button>
                        <button type="button" className="btn btn-secondary"
                                onClick={onCancelar} disabled={loading}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>

            <footer className="login-footer">
                <strong>Bolsa de Empleo</strong> — Total Soft Inc.
            </footer>
        </div>
    );
}