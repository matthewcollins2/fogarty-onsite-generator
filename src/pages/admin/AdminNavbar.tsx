import { Box, Typography, Button, Stack, Collapse } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/FOGARTY_NAME.png";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { auth as firebaseAuth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../../context/Appcontext";

const SubmitButtonStyle: SxProps<Theme> = {
  width: "150px",
  height: "50px",
  fontWeight: "bold",
  textTransform: "none"
};

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth(); 
  const [openIncoming, setOpenIncoming] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      // Optional: If you have a specific backend logout route, keep this. 
      // Otherwise, Firebase signOut is usually enough.
      await fetch("http://localhost:3000/api/admins/logout", { method: "POST" });

      setCurrentUser(null);
      navigate("/"); // Redirect to home/login after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleToggleIncoming = () => {
    setOpenIncoming((prev) => !prev);
  };

  const linkStyle: SxProps<Theme> = {
    whiteSpace: "pre-line",
    cursor: "pointer",
    fontSize: "1.1rem",
    transition: "0.3s",
    "&:hover": { color: "#1976d2", transform: "translateX(5px)" },
  };

  return (
    <Box
      sx={{
        width: "14.5vw", // Slightly wider for readability
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
        borderRight: "1px solid #ddd",
        p: 3,
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {/* Logo Section */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
        <Box component="img" src={logo} alt="Logo" sx={{ width: 250, height: 120, mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", textAlign: "center" }}>
          Admin Portal
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Stack spacing={2.5}>
          
          {/* Matches path="/dashboard" in adminroutes.tsx */}
          <Typography sx={linkStyle} onClick={() => handleNavigation("/admin/dashboard")}>
            Dashboard
          </Typography>

          {/* Incoming Requests Dropdown */}
          <Box>
            <Box onClick={handleToggleIncoming} sx={{ ...linkStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="inherit">Incoming Requests</Typography>
              {openIncoming ? <ExpandLess /> : <ExpandMore />}
            </Box>
            <Collapse in={openIncoming} timeout="auto" unmountOnExit>
              <Stack spacing={1.5} sx={{ ml: 2, mt: 1, borderLeft: "2px solid #1976d2", pl: 2 }}>
                <Typography variant="body2" sx={linkStyle} onClick={() => handleNavigation("/admin/incoming/quotes")}>
                  Quote Requests
                </Typography>
                <Typography variant="body2" sx={linkStyle} onClick={() => handleNavigation("/admin/incoming/appointments")}>
                  Appointment Requests
                </Typography>
                <Typography variant="body2" sx={linkStyle} onClick={() => handleNavigation("/admin/incoming/parts")}>
                  Parts Requests
                </Typography>


                <Typography variant="body2" sx={linkStyle} onClick={() => handleNavigation("/admin/incoming/returns")}>
                  Return Requests
                </Typography>

                
              </Stack>
            </Collapse>
          </Box>

          <Typography sx={linkStyle} onClick={() => handleNavigation("/admin/reviewed")}>
            Reviewed Appointments
          </Typography>

          <Typography sx={linkStyle} onClick={() => handleNavigation("/admin/user-management")}>
            User Management
          </Typography>

          <Typography sx={linkStyle} onClick={() => handleNavigation("/admin/inven-management")}>
            Inventory Management
          </Typography>

          <Typography sx={linkStyle} onClick={() => handleNavigation("/admin/edit-about")}>
            Edit About Page
          </Typography>

          <Typography sx={linkStyle} onClick={() => handleNavigation("/admin/review-management")}>
            Review Management
          </Typography>
          <Typography sx={linkStyle} onClick={() => handleNavigation("/admin/wave-invoice")}>
            Wave Invoice
          </Typography>
        </Stack>
      </Box>

      {/* Logout at Bottom */}
      <Box sx={{ pt: 2, borderTop: "1px solid #ddd", display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="error" sx={SubmitButtonStyle} onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default AdminNavbar;