import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Box, Grid, Stack, Typography, CircularProgress } from "@mui/material";
import logo from "../../assets/logo.png";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

function About() {
  const [text, setText] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_BASE}/pagecontent/about`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setText(data.content);
    } catch (error) {
      console.error("Failed to load content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <Navbar />
      <Grid
        container
        padding={15}
        spacing={15}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Grid>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ width: 200, height: 200 }}
          />
        </Grid>
        <Grid>
          <Stack spacing={5} maxWidth={500}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Introduction
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {text}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

export default About;
