const Home = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenido a SIMELAN</h1>
      <p>Esta es la página de inicio de tu plataforma web.</p>

      <div style={{ marginTop: "2rem" }}>
        <h2>Secciones principales:</h2>
        <ul>
          <li>Usuarios</li>
          <li>Inventario</li>
          <li>Mantenimientos</li>
          <li>Alertas</li>
        </ul>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <p>Pronto se agregarán funcionalidades como gráficos, estadísticas y gestión de datos.</p>
      </div>
    </div>
  );
};

export default Home;
