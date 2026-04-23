import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Grid, Typography, TextField, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

function EmailChange() {
  return (
    <>
      <Navbar />
      {/* Container for textboxes and confirmation button*/}
      <Container maxWidth="lg" sx={{ mt: 15, mb: 10 }}>
        
        {/* Styling and sizing for container*/}
        <Grid container spacing={0} alignItems="left">
          <Grid size={{ xs: 12, md: 15}}>

            {/* Title with sizing and alignment */}
            <Typography variant="h3" fontWeight={700} gutterBottom align="center">
              Update Email
            </Typography>

            {/*New email field */}
            <TextField
                required
                label="New Email"
                fullWidth
                sx={{mb: 3}}
            />

            {/*Confirm email field */}
            <TextField
                required
                label="Confirm Email"
                fullWidth
                sx={{mb: 3}}
            />

            {/*Password verification field*/}
            <TextField
                required
                label="Enter Account Password"
                fullWidth
                type="password"
                id="outlined-password-input"
                sx={{mb: 3}}
            />

            {/*Confirm Button*/}
            <Box sx={{mt: 3, display: "flex", gap: 2, }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                component={Link}
                to="/UserSettings">
                Confirm
              </Button>
            </Box>



           
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default EmailChange;