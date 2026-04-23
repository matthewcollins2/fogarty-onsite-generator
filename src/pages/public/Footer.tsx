import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

function Footer() {
  // Store the raw footer content from API
  // Store parsed footer fields
  const [contactHours, setContactHours] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [phone, setPhone] = useState("");

  // Fetch footer content from API on component mount
  useEffect(() => {
    // Fetch and parse footer content
    fetch(`${API_BASE}/pagecontent/footer`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        parseFooterContent(d.content || "");
      })
      .catch((err) => {
        console.error("Failed to load footer content:", err);
      });
  }, []);

  // Parse footer content by extracting Contact Hours, Open Hours, and Phone using regex
  const parseFooterContent = (content: string) => {
    // Extract Contact Hours section using regex
    const contactHoursMatch = content.match(
      /Contact Hours:\s*([\s\S]*?)(?=\n*Open Hours:|\n*Phone:|\s*$)/i,
    );
    // Extract Open Hours section
    const openHoursMatch = content.match(
      /Open Hours:\s*([\s\S]*?)(?=\n*Phone:|\n*Contact Hours:|\s*$)/i,
    );
    // Extract Phone section
    const phoneMatch = content.match(
      /Phone:\s*([\s\S]*?)(?=\n*Contact Hours:|\n*Open Hours:|\s*$)/i,
    );

    // Update state with parsed values or empty strings if not found
    setContactHours(contactHoursMatch ? contactHoursMatch[1].trim() : "");
    setOpenHours(openHoursMatch ? openHoursMatch[1].trim() : "");
    setPhone(phoneMatch ? phoneMatch[1].trim() : "");
  };

  return (
    <Box
      sx={{
        bgcolor: "Gray",
        color: "white",
        py: 3,
        px: 30,
        textAlign: "left",
        mt: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Fogarty Onsite Generator Service
      </Typography>
      <Typography variant="body2">Contact Hours: {contactHours}</Typography>
      <Typography variant="body2">Open Hours: {openHours}</Typography>
      <Typography variant="body2">Phone: {phone}</Typography>
      <Typography variant="body2">
        © {new Date().getFullYear()} Fogarty Onsite Generator Service. All
        rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer;
