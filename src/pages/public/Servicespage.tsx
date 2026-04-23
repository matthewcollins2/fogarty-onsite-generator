import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Grid, Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

function Servicespage() {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 15, mb: 30 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Services Page Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={700} align="center">
              Services
            </Typography>
          </Box>
          {/* Request Parts Box */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Button
              variant="text"
              component={Link}
              to="/RequestPart"
              style={{
                fontFamily: "Sans-serif",
                fontSize: "30px",
                color: "#000000",
                fontWeight: "bold",
                textDecoration: "underline",
                textTransform: "none",
              }}
            >
              Request Parts
            </Button>
            <Typography
              variant="h6" // smaller font
              color="text.secondary" // grayish color
              sx={{ textAlign: "left" }}
            >
              Know what part you need? Request it here or search for the part
              you need. Parts not listed need to be requested through an
              appointment.
            </Typography>
          </Box>
          {/* Parts/Generators on Hand Box */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Button
              component={Link}
              to="/CurrentStockPage"
              variant="text"
              style={{
                fontFamily: "Sans-serif",
                fontSize: "30px",
                color: "#000000",
                fontWeight: "bold",
                textDecoration: "underline",
                textTransform: "none",
              }}
            >
              Parts/Generators on hand
            </Button>
            <Typography
              variant="h6" // smaller font
              color="text.secondary" // grayish color
              sx={{ textAlign: "left" }}
            >
              These are parts that we currently have on hand and can be sold.
            </Typography>
          </Box>
          {/* Book Appointment Box */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Button
              component={Link}
              to="/Appointment"
              variant="text"
              style={{
                fontFamily: "Sans-serif",
                fontSize: "30px",
                color: "#000000",
                fontWeight: "bold",
                textDecoration: "underline",
                textTransform: "none",
              }}
            >
              Book Appointment
            </Button>
            <Typography
              variant="h6" // smaller font
              color="text.secondary" // grayish color
              sx={{ textAlign: "left" }}
            >
              Book an appointment here now!
            </Typography>
          </Box>

          {/* Contact Us Box */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Button
              variant="text"
              style={{
                fontFamily: "Sans-serif",
                fontSize: "30px",
                color: "#000000",
                fontWeight: "bold",
                textDecoration: "underline",
                textTransform: "none",
              }}
            >
              Contact Us
            </Button>
            <Typography
              variant="h6" // smaller font
              color="text.secondary" // grayish color
              sx={{ textAlign: "left" }}
            >
              Any questons or concerns? Contact us at (971) 244-2450
            </Typography>
          </Box>

          {/* Returns Box */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Button
              component={Link}
              to="/Returns"
              variant="text"
              style={{
                fontFamily: "Sans-serif",
                fontSize: "30px",
                color: "#000000",
                fontWeight: "bold",
                textDecoration: "underline",
                textTransform: "none",
              }}
            >
              Returns
            </Button>
            <Typography
              variant="h6" // smaller font
              color="text.secondary" // grayish color
              sx={{ textAlign: "left" }}
            >
              Returns? Start your return here!
            </Typography>
          </Box>

          {/* Leave a Review Button */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              gap: 2,
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Button
              component={Link}       // <-- Make it navigate
              to="/leavereview"       // <-- Route to LeaveReview page
              variant="text"
              style={{
                fontFamily: "Sans-serif",
                fontSize: "30px",
                color: "#000000",
                fontWeight: "bold",
                textDecoration: "underline",
                textTransform: "none",
              }}
            >
              Leave a Review
            </Button>
          </Box>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default Servicespage;
