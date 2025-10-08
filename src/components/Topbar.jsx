import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { AuthContext } from "../context/AuthContext";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleClose();
  };
  const handleSettings = () => {
    navigate("/settings");
    handleClose();
  };
  const handleLogoClick = () => navigate("/home");

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#fff",
        color: "#222",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Izquierda: Logo + Menu lateral */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton edge="start" color="inherit" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={handleLogoClick}
          >
            <img src={Logo} alt="SIMET Logo" style={{ height: "40px" }} />
          </Box>
        </Box>

        {/* Derecha: Alertas + Perfil */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Icono de alertas */}
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Perfil */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                gap: 1,
              }}
              onClick={handleProfileClick}
            >
              <Avatar sx={{ bgcolor: "#9D3194" }}>
                {user.username ? user.username[0].toUpperCase() : "U"}
              </Avatar>
              <Box>{user.username || user.nombre}</Box>
            </Box>

            {/* Menú desplegable */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleSettings}>Configuraciones</MenuItem>
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
