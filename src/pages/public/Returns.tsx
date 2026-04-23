import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../../context/Appcontext";
import { auth } from "../../firebase"; 
import React, { useState, useEffect, useMemo } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Divider, 
  Grid, 
  Paper,
  CircularProgress
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import axios from "axios";

function Returns() {
  const { currentUser } = useAuth();
  
  
  // Form State
  const [generatorModel, setGeneratorModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const api = useMemo(() => axios.create({ baseURL: "http://localhost:3000/api" }), []);

  useEffect(() => {
    const interceptorId = api.interceptors.request.use(async (config) => {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(interceptorId);
  }, [api]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) { 
      setResponseMsg("You must be logged in to submit an RMA."); 
      return; 
    }

    setIsSubmitting(true);
    setResponseMsg("");

    try {

      // Submit to MongoDB
      const res = await api.post("/returns", {
        userID: currentUser.userID,
        name: currentUser.name,
        email: currentUser.email,
        generatorModel: generatorModel,
        serialNumber: serialNumber || null,
        condition: condition,
        reason: description,
        status: "Pending",
      });

      setResponseMsg(res.data.message || "RMA Request submitted successfully!");
      
      // Reset form
      setGeneratorModel("");
      setSerialNumber("");
      setDescription("");
      setCondition("");
    } catch (err: any) {
      setResponseMsg(err.response?.data?.message || "Error submitting return request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 8, mb: 10 }}>
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" }, 
          gap: 6, 
          alignItems: "start" 
        }}>
          
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>Return Merchandise </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Fill out the details below and submit your completed RMA form.
            </Typography>

            {!currentUser ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                <Typography>Please log in to access the Return Portal.</Typography>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={12} >
                      <TextField label="Customer Name" value={currentUser.name || ""} fullWidth disabled />
                    </Grid>
                    <Grid size={12}>
                      <TextField label="Account Email" value={currentUser.email || ""} fullWidth disabled />
                    </Grid>
                    <Grid size={12}>
                      <TextField required label="Generator Model" name="generatorModel" value={generatorModel} onChange={(e) => setGeneratorModel(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={12}>
                      <TextField label="Serial Number (Optional)" name="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={12}>
                      <TextField label="Condition" name="condition"  value={condition} onChange={(e) => setCondition(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={12}>
                      <TextField required label="Detailed Reason" name="reason" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} fullWidth />
                    </Grid>

                    <Grid size={12}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        type="submit" 
                        disabled={isSubmitting}
                        sx={{ py: 1.5, fontWeight: 600, bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}
                      >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Submit Return Request"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
                {responseMsg && (
                <Typography
                  data-testid="response-message"
                  sx={{
                    mt: 2,
                    textAlign: "center",
                    color: responseMsg.toLowerCase().includes("error") ? "red" : "green"
                  }}
                >
                  {responseMsg}
                </Typography>
              )}
              </Paper>
            )}
          </Box>

          {/* Right Side: Non signed in user steps & requirements for return */}
          <Box sx={{ mt: { xs: 0, md: 12 } }}>
            <Paper elevation={0} sx={{ p: 4, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 4 }}>
              
              <Typography variant="h6" fontWeight={700} gutterBottom>No account?</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download our official RMA form, fill it out, and email it to us!
              </Typography>
              
              {/* Download Button */}
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                startIcon={<DownloadIcon />}
                href="/return.pdf"
                download="return.pdf"
                sx={{ mb: 4, textTransform: 'none' }}
              >
                Download RMA Form
              </Button>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" fontWeight={700} gutterBottom>Return Guidelines</Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} color="primary">30-Day Window</Typography>
                <Typography variant="body2" color="text.secondary">Items must be returned within 30 days of delivery.</Typography>
              </Box>
              
              <Box sx={{ p: 2, bgcolor: '#fff7ed', borderRadius: 2, border: '1px solid #ffedd5' }}>
                <Typography variant="caption" color="#9a3412" fontWeight={600}>
                  IMPORTANT: Submission does not guarantee approval. Our team will review your uploaded form.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}

export default Returns;