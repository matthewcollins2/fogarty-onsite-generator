import Navbar from "./Navbar";
import Footer from "./Footer";
import {AppBar, Toolbar, Box, Button, Typography, Container} from "@mui/material";

function ContactPage() {
  return (
    <>
      {/* ===== Navbar Section ===== */}
      <Navbar />

      {/* ===== Main Content ===== */}
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mt: 8,
          mb: 12,
        }}
      >
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Phone: (971) 244-2450
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Email: 
        </Typography>
      </Container>

      {/* ===== Footer Info ===== */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 8,
          px: 8,
          pb: 6,
        }}
      >
        {/* Contact Hours */}
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Contact Hours
          </Typography>
          <Typography>Monday:</Typography>
          <Typography>Tuesday:</Typography>
          <Typography>Wednesday:</Typography>
          <Typography>Thursday:</Typography>
          <Typography>Friday:</Typography>
          <Typography>Saturday:</Typography>
          <Typography>Sunday:</Typography>
        </Box>
      </Box>

      <Footer />
    </>
  );
}

export default ContactPage;
