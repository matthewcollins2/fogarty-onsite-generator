import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  type SxProps,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/Appcontext";
import { auth } from "../../firebase";
import { setPersistence, browserSessionPersistence, signInWithEmailAndPassword } from "firebase/auth";

const ContainerStyle: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "white",
  borderRadius: "32px",
  padding: "20px 20px",
  maxWidth: "450px",
};

const TitleStyle: SxProps<Theme> = { alignSelf: "center" };
const ImageStyle: SxProps<Theme> = { width: "120px", height: "120px", alignSelf: "center" };
const FormStyle: SxProps<Theme> = { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" };
const TextFieldStyle: SxProps<Theme> = { width: "350px", height: "90px" };
const SubmitButtonStyle: SxProps<Theme> = { width: "150px", height: "50px" };

const Login: React.FC = () => {
  const firstRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth(); // setCurrentUser is available from useAuth

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleClearError = () => {
    setIsError(false);
    setErrorMsg("");
  }

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);
    setErrorMsg("");

    try {
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;


      const idToken = await firebaseUser.getIdToken();


      const response = await fetch(`http://localhost:3000/api/users/me/${firebaseUser.uid}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${idToken}`, // Send the token to your middleware
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        // If the backend returns 401/403/404
        throw new Error("You are not authorized to access the Admin panel.");
      }

      const userData = await response.json();

      // 4. Update Global State & Navigate
      setCurrentUser(userData.user);
      navigate("/admin");

    } catch (err: any) {
      console.error("Login error:", err);
      setIsError(true);

      // Handle specific Firebase error codes for better UX
      if (err.code === "auth/invalid-credential") {
        setErrorMsg("Invalid email or password.");
      } else {
        setErrorMsg(err.message || "An error occurred during login.");
      }
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Stack direction="column" spacing="20px" sx={ContainerStyle}>
        <Box component="img" src={logo} alt="logo" sx={ImageStyle} />
        <Typography variant="h4" sx={TitleStyle}>Admin Login</Typography>

        <Box component="form" onSubmit={handleSubmit} sx={FormStyle}>
          <TextField
            inputRef={firstRef}
            sx={TextFieldStyle}
            label="Email"
            placeholder="admin@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={handleClearError}
            error={isError}
            required
          />
          <TextField
            sx={TextFieldStyle}
            label="Password"
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handleClearError}
            error={isError}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={SubmitButtonStyle}
          >
            SIGN IN
          </Button>
        </Box>
        {errorMsg && (
          <Typography variant="body1" color="red" sx={{ textAlign: "center", mt: 1 }}>
            {errorMsg}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default Login;