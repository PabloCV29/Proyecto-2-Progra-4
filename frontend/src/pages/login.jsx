import { useState } from "react";
import { useApp } from "../AppProvider";
import "./login.css";

export default function Login({ onCancelar, onLoginExitoso }) {
    const { login } = useApp();
    const [formData, setFormData]         = useState({ id: "", clave: "" });
    const [error, setError]               = useState("");
    const [loading, setLoading]           = useState(false);
    const [mostrarClave, setMostrarClave] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(formData),
            });

            if (!res.ok) {
                setError("Credenciales inválidas. Verificá tu usuario y contraseña.");
                return;
            }

            const data = await res.json();

            // Guardar en localStorage
            localStorage.setItem("token",  data.token);
            localStorage.setItem("rol",    data.rol);
            localStorage.setItem("nombre", data.nombre);
            localStorage.setItem("userId", data.id);

            // Sincronizar AppProvider con los datos recién guardados
            login(data.rol);

            onLoginExitoso(data.rol);
        } catch {
            setError("Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-main">
                <div className="login-card">
                    <h2>Iniciar Sesión</h2>

                    {error && <div className="login-error">✕ {error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="id">Correo o ID</label>
                            <input
                                type="text"
                                id="id"
                                name="id"
                                placeholder="correo@ejemplo.com"
                                value={formData.id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="clave">Contraseña</label>
                            <div className="input-clave-wrapper">
                                <input
                                    type={mostrarClave ? "text" : "password"}
                                    id="clave"
                                    name="clave"
                                    placeholder="**********"
                                    value={formData.clave}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn-toggle-clave"
                                    onClick={() => setMostrarClave((v) => !v)}
                                >
                                    {mostrarClave ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-login-submit" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCancelar}
                            disabled={loading}
                            style={{ marginTop: "4px" }}
                        >
                            Cancelar
                        </button>
                    </form>
                </div>
            </div>

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
}