import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import AdminNavbar from "./AdminNavbar";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

// Admin page for editing page content (About, FAQ, Footer)
function EditPageContent() {
  // State for storing content from three different pages
  const [aboutContent, setAboutContent] = useState("");
  const [faqContent, setFaqContent] = useState("");
  const [footerContent, setFooterContent] = useState("");
  const [quoteRetentionDays, setQuoteRetentionDays] = useState("");
  const [appointmentRetentionDays, setAppointmentRetentionDays] = useState("");
  // Loading state to show spinner while fetching
  const [loading, setLoading] = useState(true);
  // Tracks which section was recently saved
  const [saved, setSaved] = useState<string | null>(null);
  // Error message display
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllContent();
  }, []);

  // Fetch all three content sections from the API on component mount
  const fetchAllContent = async () => {
    try {
      // Fetch all three sections in parallel for better performance
      const [aboutRes, faqRes, footerRes] = await Promise.all([
        fetch(`${API_BASE}/pagecontent/about`, { credentials: "include" }),
        fetch(`${API_BASE}/pagecontent/faq`, { credentials: "include" }),
        fetch(`${API_BASE}/pagecontent/footer`, { credentials: "include" }),
      ]);

      // Parse responses and update state
      const aboutData = await aboutRes.json();
      const faqData = await faqRes.json();
      const footerData = await footerRes.json();
      let quoteData: any = { content: "" };
      let apptData: any = { content: "" };
      try {
        const [quoteRes, apptRes] = await Promise.all([
          fetch(`${API_BASE}/pagecontent/quoteRetentionDays`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/pagecontent/appointmentRetentionDays`, {
            credentials: "include",
          }),
        ]);
        if (quoteRes.ok) quoteData = await quoteRes.json();
        if (apptRes.ok) apptData = await apptRes.json();
      } catch {
        // ignore, we'll default to empty
      }

      setAboutContent(aboutData.content || "");
      setFaqContent(faqData.content || "");
      setFooterContent(footerData.content || "");
      setQuoteRetentionDays(quoteData.content || "");
      setAppointmentRetentionDays(apptData.content || "");
    } catch (err) {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  // Save content to API for a specific section (about, faq, or footer)
  const handleSave = async (section: string, content: string) => {
    try {
      // Send PUT request to update the content for the specified section
      const response = await fetch(`${API_BASE}/pagecontent/${section}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Save failed");
      // Show success notification for 3 seconds
      setSaved(section);
      setTimeout(() => setSaved(null), 3000);
    } catch (err) {
      setError("Failed to save content");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <AdminNavbar />
      <Box padding={6} marginLeft="14vw">
        <Typography variant="h4" gutterBottom>
          Edit Page Content
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}

        {/* About */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            About Page
          </Typography>
          {saved === "about" && <Alert severity="success">Saved!</Alert>}
          <TextField
            fullWidth
            multiline
            rows={10}
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={() => handleSave("about", aboutContent)}
            sx={{ mt: 2 }}
          >
            Save About
          </Button>
        </Box>

        {/* FAQ */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            FAQ Page
          </Typography>
          {saved === "faq" && <Alert severity="success">Saved!</Alert>}
          <TextField
            fullWidth
            multiline
            rows={10}
            value={faqContent}
            onChange={(e) => setFaqContent(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={() => handleSave("faq", faqContent)}
            sx={{ mt: 2 }}
          >
            Save FAQ
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Footer Content
          </Typography>
          {saved === "footer" && <Alert severity="success">Saved!</Alert>}
          <TextField
            fullWidth
            multiline
            rows={10}
            value={footerContent}
            onChange={(e) => setFooterContent(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={() => handleSave("footer", footerContent)}
            sx={{ mt: 2 }}
          >
            Save Footer
          </Button>
        </Box>

        {/* Quote retention setting */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Quote retention (days)
          </Typography>
          {saved === "quoteRetentionDays" && (
            <Alert severity="success">Saved!</Alert>
          )}
          <TextField
            type="number"
            fullWidth
            inputProps={{ min: 30, max: 365 }}
            value={quoteRetentionDays}
            onChange={(e) => setQuoteRetentionDays(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={() => {
              const num = parseInt(quoteRetentionDays);
              if (isNaN(num) || num < 30 || num > 365) {
                setError("Retention must be between 30 and 365 days");
                return;
              }
              handleSave("quoteRetentionDays", quoteRetentionDays);
            }}
            sx={{ mt: 2 }}
          >
            Save Retention
          </Button>
        </Box>

        {/* Appointment retention setting */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Appointment retention (days)
          </Typography>
          {saved === "appointmentRetentionDays" && (
            <Alert severity="success">Saved!</Alert>
          )}
          <TextField
            type="number"
            fullWidth
            inputProps={{ min: 30, max: 365 }}
            value={appointmentRetentionDays}
            onChange={(e) => setAppointmentRetentionDays(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={() => {
              const num = parseInt(appointmentRetentionDays);
              if (isNaN(num) || num < 30 || num > 365) {
                setError("Retention must be between 30 and 365 days");
                return;
              }
              handleSave("appointmentRetentionDays", appointmentRetentionDays);
            }}
            sx={{ mt: 2 }}
          >
            Save Retention
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default EditPageContent;
