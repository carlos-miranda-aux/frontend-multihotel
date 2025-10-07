import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nombre: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/register", formData);

      // ✅ Si tu backend devuelve token tras registrarse
      if (response.data.token) {
        const { token, user } = response.data;
        login(token, user);
        navigate("/home");
      } else {
        // ✅ Si solo confirma registro
        setSuccess("Usuario creado correctamente, ahora puedes iniciar sesión.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error("Error completo:", err);

      // 1️⃣ Error devuelto por el backend (ej: 400, 401)
      if (err.response && err.response.data) {
        setError(
          err.response.data.message ||
          err.response.data.error ||
          "Error al crear el usuario."
        );
      } 
      // 2️⃣ Problema de conexión o sin respuesta
      else if (err.request) {
        setError("No se pudo conectar con el servidor. Intenta más tarde.");
      } 
      // 3️⃣ Otros errores de JS
      else {
        setError(err.message || "Ocurrió un error inesperado.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "350px", margin: "50px auto", textAlign: "center" }}>
      <h2>Crear cuenta</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
        />
        <input
          type="text"
          name="username"
          placeholder="Nombre de usuario"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrarse</button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}

      <p style={{ marginTop: "10px" }}>
        ¿Ya tienes cuenta?{" "}
        <a href="/login" style={{ color: "blue" }}>
          Inicia sesión
        </a>
      </p>
    </div>
  );
};

export default SignUp;
