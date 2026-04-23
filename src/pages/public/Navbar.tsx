import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../../firebase"; 
import { signOut } from "firebase/auth";
import { useAuth } from "../../context/Appcontext"; 
import logo from "../../assets/fogarty_logo_transparent.png";
import logo_name from "../../assets/FOGARTY_NAME.png"
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  Snackbar,
  Alert,
  Typography,
  type SxProps,
} from "@mui/material";
import type { Theme } from "@emotion/react";

const ImageStyle: SxProps<Theme> = {
  width: 150,
  height: 100,
  alignSelf: "center",
};

function Navbar() {
  const { currentUser, setCurrentUser, authReady, isAdmin } = useAuth(); 
  const navigate = useNavigate();
  const [logoutMsg, setLogoutMsg] = useState<string | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const pages = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Services", to: "/services" },
    { label: "Contact", to: "/Contactpage" },
    { label: "FAQ", to: "/faq" },
    { label: "Reviews", to: "/ViewReviews" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setLogoutMsg("Logged out successfully");
      setLogoutOpen(true);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setCurrentUser(null);
      navigate("/userlogin");
    }
  };

  const handleLogoutClose = (_?: any, reason?: string) => {
    if (reason === "clickaway") return;
    setLogoutOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "white", color: "black", boxShadow: 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            {/* Logo and Brand */}
            <Box 
              component={NavLink} 
              to="/" 
              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
            >
              <Box component="img" src={logo} alt="logo" sx={ImageStyle} />
              <Box component="img" src={logo_name} alt="logo" sx={{width: 200, height: 100}} />
            </Box>

            {/* Main Navigation Links */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, ml: 2 }}>
              {pages.map((page) => (
                <Button
                  key={page.label}
                  component={NavLink}
                  to={page.to}
                  end={page.to === "/"}
                  sx={{ 
                    my: 2, 
                    color: "black", 
                    display: "block",
                    "&.active": { fontWeight: 'bold', color: 'primary.main' } 
                  }}
                >
                  {page.label}
                </Button>
              ))}

              {!currentUser && (
                <Button
                  component={NavLink}
                  to="/UserRegistration"
                  sx={{ my: 2, color: "black", display: "block" }}
                >
                  Request Account
                </Button>
              )}
            </Box>

            {/* Auth Section (Right Side) */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {!authReady ? (
                <Box sx={{ width: 40 }} /> 
              ) : currentUser ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  
                  {/* ADMIN BUTTON: Ensures visibility next to user info */}
                  {isAdmin && (
                    <Button
                      component={NavLink}
                      to="/admin/dashboard"
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ 
                        textTransform: "none", 
                        fontWeight: "bold",
                        px: 2,
                        display: { xs: "none", sm: "flex" } 
                      }}
                    >
                      Admin Dashboard
                    </Button>
                  )}

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <Button 
                      component={NavLink} 
                      to="/usersettings" 
                      sx={{ textTransform: "none", color: 'black', p: 0, minWidth: 0, fontSize: '0.8rem' }}
                    >
                      Settings
                    </Button>
                    <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1, fontWeight: 500 }}>
                      {currentUser.name || currentUser.email}
                    </Typography>
                  </Box>
                  <Button color="error" variant="outlined" size="small" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              ) : (
                <Button 
                  color="primary" 
                  variant="contained"
                  component={NavLink} 
                  to="/userlogin"
                  sx={{ textTransform: "none" }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Snackbar 
        open={logoutOpen} 
        autoHideDuration={3000} 
        onClose={handleLogoutClose} 
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleLogoutClose} severity="success" sx={{ width: "100%" }}>
          {logoutMsg}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Navbar;