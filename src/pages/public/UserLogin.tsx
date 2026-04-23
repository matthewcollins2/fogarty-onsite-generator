import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { setPersistence, browserSessionPersistence, signInWithEmailAndPassword } from "firebase/auth";
import ForgotPassword from "./ForgotPassword";
import { Link } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",
  withCredentials: true, // not using cookies yet; set true when JWT cookies
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate()
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({
    open: false,
    msg: "",
    sev: "success",
  });

  const emailError = email.trim() === "";
  const passwordError = password.trim() === "";
  const formValid = !emailError && !passwordError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // 1. Authenticate with Firebase
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.toLowerCase().trim(),
        password.trim()
      );

      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // 2. Verify profile exists in MongoDB
      try {
        await api.get(`/users/me/${firebaseUser.uid}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        // If we reach here, user exists in both places
        setSnack({ open: true, msg: "Welcome back!", sev: "success" });
        setTimeout(() => navigate("/"), 1000);

      } catch (dbErr: any) {
        // If the DB returns 404, the user was deleted from the backend
        if (dbErr.response?.status === 404) {
          await auth.signOut(); // Force logout from Firebase
          setSnack({
            open: true,
            msg: "This account has been deactivated or not found.",
            sev: "error"
          });
        } else {
          throw dbErr; // Rethrow other errors
        }
      }

    } catch (err: any) {
      // Handle Firebase specific errors
      let msg = "Login failed";

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        msg = "Invalid email or password";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "Too many failed attempts. Try again later.";
      } else {
        msg = err.message || "Login failed";
      }

      setSnack({ open: true, msg, sev: "error" });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <Navbar />

      <Box
        component="main"
        sx={{
          minHeight: "calc(100vh - 160px)", // leaves room for header/footer
          display: "grid",
          placeItems: "center",
          px: 2,
          py: 6,
          bgcolor: "background.default",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your email and password to continue.
          </Typography>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              helperText={emailError ? "Email is required" : " "}
            />

            <TextField
              label="Password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              helperText={passwordError ? "Password is required" : " "}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPw ? "Hide password" : "Show password"}
                      onClick={() => setShowPw((s) => !s)}
                      edge="end"
                    >
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel control={<Checkbox defaultChecked={false} />} label="Remember me" />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!formValid}
              sx={{ mt: 1 }}
            >
              Sign In
            </Button>

            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                variant="text"
                size="small"
                component={Link}
                to="/forgot-password"
              >
                Forgot password?
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Footer />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
