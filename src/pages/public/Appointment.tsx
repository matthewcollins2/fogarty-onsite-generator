import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Box, Typography, Button, TextField, CircularProgress, Divider, Grid, Paper } from "@mui/material";
import { useAuth } from "../../context/Appcontext"; // 1. Import your global context
import { auth } from "../../firebase"; // 2. Needed to get the fresh token
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import axios from "axios";

function Appointment() {
  // 3. Pull user and readiness state from Context
  const { currentUser, authReady } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day').format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState("");
  const [generatorModel, setGeneratorNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [description, setDescription] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [busyRanges, setBusyRanges] = useState<{start: dayjs.Dayjs, end: dayjs.Dayjs}[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const api = useMemo(() => axios.create({ baseURL: "http://localhost:3000/api" }), []);

  const timeSlots = useMemo(() => {
    const slots = [];
    let start = dayjs().set('hour', 8).set('minute', 0);
    const end = dayjs().set('hour', 20).set('minute', 0);
    
    while (start.isBefore(end) || start.isSame(end)) {
      slots.push(start.format("h:mm A"));
      start = start.add(30, 'minute');
    }
    return slots;
  }, []);

    const isTimeSlotBooked = (timeStr: string) => {
    const slotStart = dayjs(`${selectedDate} ${timeStr}`, "YYYY-MM-DD h:mm A");
    return busyRanges.some(range => 
      (slotStart.isSame(range.start) || slotStart.isAfter(range.start)) && slotStart.isBefore(range.end)
    );
  };
  

  // 4. Handle Submission with the Firebase Token
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!currentUser) { setResponseMsg("You must be logged in."); return; }
  if (!selectedTime) { setResponseMsg("Select a time."); return; }

  try {
    const appointmentDateTime = dayjs(`${selectedDate} ${selectedTime}`, "YYYY-MM-DD h:mm A").toISOString();
    const appointmentEndDateTime = dayjs(appointmentDateTime).add(1, "hour").toISOString();

    const res = await api.post("/appointments", {
      userID: currentUser.userID,
      email: currentUser.email,   
      name: currentUser.name, 
      generatorModel,
      serialNumber,
      description,
      appointmentDateTime,
      appointmentEndDateTime,
    });

    setResponseMsg(res.data.message || "Request submitted successfully!");
    setGeneratorNumber("");
    setSerialNumber("");
    setDescription("");
    setSelectedTime("");
  } catch (err: any) {
    setResponseMsg(err.response?.data?.message || "Error submitting request.");
  }
};
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

 useEffect(() => {
  if (!authReady) return; // wait until firebase context is ready
  // if your /busy endpoint is protected, also require currentUser:
  // if (!currentUser) return;

  const fetchBusy = async () => {
    setLoadingSlots(true);
    try {
      const from = dayjs(selectedDate).startOf("day").toISOString();
      const to = dayjs(selectedDate).endOf("day").toISOString();

      const res = await api.get(
        `/appointments/busy?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );

      const mapped = (res.data ?? [])
        .map((r: any) => ({ start: dayjs(r.start), end: dayjs(r.end) }))
        .filter((r: any) => r.start.isValid() && r.end.isValid());

      setBusyRanges(mapped);
    } catch (err: any) {
      console.error(
        "busy fetch failed:",
        err?.response?.status,
        err?.response?.data || err.message
      );
      setBusyRanges([]); // make sure it doesn't keep stale data
    } finally {
      setLoadingSlots(false);
    }
  };

  fetchBusy();
}, [authReady, currentUser, selectedDate, api]);

  // 6. Handle the Loading State
  if (!authReady) {
    return (
      <Container sx={{ mt: 15, textAlign: "center" }}>
        <Typography>Checking authentication...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fff' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4, alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom align="center">Book Appointment</Typography>
            {!currentUser ? (
              <Typography align="center" sx={{ mt: 3 }}>Please log in to book.</Typography>
            ) : (
              <form onSubmit={handleSubmit}>
                {/*<TextField label="User ID" value={currentUser.userID} fullWidth sx={{ mb: 3 }} disabled />*/}
                <TextField label="Name" value={currentUser.name || ""} fullWidth sx={{ mb: 2 }} disabled />
                <TextField name="generatorModel" label="Generator Model" value={generatorModel} onChange={(e) => setGeneratorNumber(e.target.value)} fullWidth sx={{ mb: 3 }} />
                <TextField name="serialNumber" label="Serial Number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} fullWidth sx={{ mb: 3 }} />
                <TextField name="description" required label="Problem Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={4} fullWidth sx={{ mb: 3 }} />
                <Button variant="contained" color="primary" size="large" type="submit" disabled={!selectedTime}>Submit Request</Button>
              </form>
            )}
            {responseMsg && <Typography sx={{ mt: 2 }} color="primary" align="center">{responseMsg}</Typography>}
          </Box>

          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom align="center">Select Date & Time</Typography>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 4 }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>1. Choose Date</Typography>
                <TextField 
                  type="date" 
                  fullWidth 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  inputProps={{ min: dayjs().format("YYYY-MM-DD"), max: dayjs().add(2 , 'month').format("YYYY-MM-DD")}} 
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Divider sx={{ mb: 4 }} />
              <Box sx={{ position: 'relative' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>2. Select Available Time</Typography>
                {loadingSlots && <Box sx={{ position: 'absolute', right: 0, top: 0 }}><CircularProgress size={20} /></Box>}
                <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                  <Grid container spacing={1.5}>
                    {timeSlots.map((time) => {
                      const isSelected = selectedTime === time;
                      const isBooked = isTimeSlotBooked(time);
                      return (
                        <Grid size={4} key={time}>
                          <Button
                            fullWidth
                            variant={isSelected ? "contained" : "outlined"}
                            onClick={() => setSelectedTime(time)}
                            disabled={isBooked}
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              borderColor: isSelected ? 'primary.main' : isBooked ? '#f1f5f9' : '#e0e0e0',
                              color: isSelected ? '#fff' : isBooked ? '#cbd5e1' : 'text.secondary',
                              bgcolor: isSelected ? 'primary.main' : isBooked ? '#f8fafc' : 'transparent',
                              '&.Mui-disabled': { color: '#cbd5e1', borderColor: '#f1f5f9', bgcolor: '#f8fafc', textDecoration: 'line-through' },
                            }}
                          >
                            {time}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}


export default Appointment;