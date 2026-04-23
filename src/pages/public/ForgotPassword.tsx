import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { TextField, Button, Typography, Container, Box, Alert } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const oobCode = query.get("oobCode");

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setMessage("Check your inbox for the reset link!");
                setError("");
            })
            .catch((err) => {
                setError(err.message);
                setMessage("");
            });
    };

    const handleConfirmReset = (e: React.FormEvent) => {
        e.preventDefault();
        const auth = getAuth();
        if (oobCode) {
            confirmPasswordReset(auth, oobCode, newPassword)
                .then(() => {
                    setMessage("Password changed! You can now login.");
                    setError("");
                    setTimeout(() => navigate("/userlogin"), 3000);
                })
                .catch((err) => {
                    setError(err.message);
                    setMessage("");
                });
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5">
                    {oobCode ? "Enter New Password" : "Reset Password"}
                </Typography>

                {message && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

                {oobCode ? (
                    <form onSubmit={handleConfirmReset} style={{ width: '100%', marginTop: '1rem' }}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            type="password"
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
                            Update Password
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleSendEmail} style={{ width: '100%', marginTop: '1rem' }}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
                            Send Reset Link
                        </Button>
                    </form>
                )}

                <Link to="/userlogin" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary" align="center">
                        Back to Login
                    </Typography>
                </Link>
            </Box>
        </Container>
    );
};

export default ForgotPassword;