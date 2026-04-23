import Navbar from "../admin/AdminNavbar";
// Import the standard Grid that works in all MUI v5 versions
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useAuth } from "../../context/Appcontext"; 
import { Navigate, useNavigate } from "react-router-dom";
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventNoteIcon from '@mui/icons-material/EventNote';
import React, { useEffect, useMemo, useState } from 'react';
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";

interface ReviewedAppointment {
  _id: string;
  appointmentDateTime: string;
  name: string;
  phone: string;
  email: string; 
  rescheduledDateTime?: string | null;
}
const formatISO = (iso?: string | null) => {
  if (!iso) return "-";
  const dt = dayjs(iso);
  return dt.isValid() ? dt.format("MMM DD, YYYY @ h:mm A") : "-";
};

const formatISO2 = (iso?: string | null) => {
  if (!iso) return "-";
  const dt = dayjs(iso);
  return dt.isValid() ? dt.format("MMM DD, YYYY") : "-";
};

interface ReviewRow {
      id: string;
      name: string;
      rating: string | number;
      comment: string;
      date: string;
      isVerified: boolean;
      service: string;
};


const Dashboard = () => {
  const { currentUser, authReady } = useAuth(); // Using authReady as discussed
  const navigate = useNavigate();
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (!authReady) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/userlogin" replace />;
  }

   const [pendingAppointCount, setAppointPendingCount] = useState<number>(0); // displays appointments that are status: pending
  const [pendingQuoteCount, setQuotePendingCount] = useState<number>(0); // displays quote requests that are not acknowledged (acknowledged = false)
  const [pendingPartCount, setPartPendingCount] = useState<number>(0); // displays part requests with status: To-do

  const [rowsAppoint, setRowsAppoint] = useState<ReviewedAppointment[]>([]);
  const [rowsReview, setRowsReview] = useState<ReviewRow[]>([]);

  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState<boolean>(true);

  // useEffect for fetching pending appointment counts
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/appointments/pending-count");

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Data from server:", data);
        setAppointPendingCount(data.count);

      } catch (error) {
        console.error("Error fetching appointment count:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []);
  // useEffect for fetching pending quotes counts
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/quotes/pending-quotes");

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Data from server:", data);
        setQuotePendingCount(data.count);

      } catch (error) {
        console.error("Error fetching quote count:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []);
  // useEffect for fetching pending part request counts
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/partrequests/pending-parts");

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Data from server:", data);
        setPartPendingCount(data.count);

      } catch (error) {
        console.error("Error fetching part count:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []);

  // useEffect and table for fetching upcoming appointment info
  useEffect(() => {
    const fetchAppoint = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/appointments/reviewed");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load appointments");

        setRowsAppoint(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppoint();
  }, []);

  const columnAppoint: GridColDef<ReviewedAppointment>[] = [
    {
      field: "original",
      headerName: "Date",
      flex: 1.3,
      maxWidth: 190,
      sortable: true,
      // if no rescheduled date gets original date, else get rescheduled date
      valueGetter: (_value, row) => {
        const dateToProcess = row.rescheduledDateTime || row.appointmentDateTime;
        return dateToProcess ? new Date(dateToProcess) : '';
      },
      valueFormatter: (value) => {
        if (!value) return '';
        return formatISO(value); 
      },
    },
    { field: "name", headerName: "Name", flex: 1, maxWidth: 190, minWidth: 50 },
    { field: "phone", headerName: "Phone", flex: 1, maxWidth:130, minWidth: 50 },
    { field: "email", headerName: "Email", flex: 1.3, maxWidth:230, minWidth: 50 },
  ];

  // useEffect and table for reviews
    const getReviews = async () => {
      const res = await fetch("http://localhost:3000/api/reviews", {method: "GET"});
      // array of reviews is returned
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      const tmp: ReviewRow[] = data.map((review: any) => ({
        id: String(review.id || review._id),
        name: review.name ?? "",
        rating: review.rating ?? "",
        comment: review.comment ?? "",
        date: review.createdAt ? new Date(review.createdAt).toISOString().slice(0, 10) : "",
        isVerified: review.verified ?? false,
        service: review.service ?? "N/A",
      }));
      setRowsReview(tmp);
      setLoading(true);
    };
    
    useEffect(() => {
      (async () => {
        try {
          setLoading(false);
          await getReviews(); 
        } catch (err: any) {
          console.error("Error fetching reviews:", err);
          setLoading(true);
        }
      })();
    }, []);

  // filtering logic for reviews
  const filteredReviews = useMemo(() => {
    if (timeframe === 'all') return rowsReview;

    const now = new Date();
    const cutoff = new Date();

    if (timeframe === 'week') cutoff.setDate(now.getDate() - 7);
    else if (timeframe === 'month') cutoff.setMonth(now.getMonth() - 1);
    else if (timeframe === 'year') cutoff.setFullYear(now.getFullYear() - 1);

    return rowsReview.filter((row) => {
      if (!row.date) return false;
      const reviewDate = new Date(row.date);
      return reviewDate >= cutoff;
    });
  }, [timeframe, rowsReview]);
    
    // view card for reviews
    const [openReview, setOpenReview] = useState(false);
    const [activeReview, setActiveReview] = useState<ReviewRow | null>(null);
    const handleOpenReview = (row: ReviewRow) => {
      setActiveReview(row);
      setOpenReview(true);
    };

    const handleCloseReview = () => {
      setOpenReview(false);
      setActiveReview(null);
    };

    const columnReview: GridColDef[] = [
      { field: "date", headerName: "Date Created", width: 150, editable: false,
        valueFormatter: (value) => {
          if (!value) return '';
          return formatISO2(value); 
        }, 
      },
      { field: "name", headerName: "Name", width: 200, editable: false },
      { field: "view", headerName: "View", width: 90, sortable: false, filterable: false,
        renderCell: (params: any) => (
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpenReview(params.row as ReviewRow)}
          >
            View
          </Button>
        ),
      },
      { field: "rating", headerName: "Rating", width: 150, editable: false },
      { field: "service", headerName: "Service", width: 150, editable: false },      
    ];

   return (
    <Box sx={{ display: "flex", backgroundColor: "#fafafa" }}>
      <Navbar />
      <Box sx={{ 
          marginLeft: "15vw",
          marginTop: "5vh", 
          height: "100vh",
          width: "90vw",
          flex: 1,
          gap: 2, 
          p: 4,
          backgroundColor: "#fafafa",
          display: "flex",
          flexDirection: "column",
          
        }}
      >
        
        <Box sx={{ // box holds new appointments, quotes, and parts
          //backgroundColor: "#c7adad",
          height: "40vh",
          width: "79vw",
          margin: "10px",
          display: "flex",
          flexDirection: "row",
          gap: 5,

        }}>
          <Box sx={{
            //backgroundColor: "#fc5858",
            height: "40vh",
            width: "40vw",
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#1976d2",
                whiteSpace: "nowrap",
                padding: 2,
                borderBottom: "3px solid",
                borderColor: "#e6e6e6",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { color: "#76bbff" },
                //backgroundColor: "#834747",
              }}
              onClick={() => handleNavigation("/admin/incoming/appointments")}
            >
              Pending Appointments
            </Typography>

            <Box sx={{
              //backgroundColor: "#6eeb7d",
              height: "33vh",
              width: "25vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "end",
            }}>
              <Box sx={{
                  backgroundColor: "#ffffff",
                  height: "30vh",
                  width: "30vw",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                
                <Box sx={{ // box holds the text for number of pending appopintments
                  //backgroundColor: "#c67777",
                  height: "30vh",
                  width: "25vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h1" sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main' 
                    }}>
                      {(pendingAppointCount)}
                    </Typography>
                  )}
                  <Typography 
                    variant="h5" 
                    color="Secondary"
                    sx={{
                      margin: "40px",
                    }}>
                    Appointments
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{
            //backgroundColor: "#ffffff",
            height: "40vh",
            width: "40vw",
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#1976d2",
                whiteSpace: "nowrap",
                padding: 2,
                borderBottom: "3px solid",
                borderColor: "#e6e6e6",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { color: "#76bbff" },
              }}
              onClick={() => handleNavigation("/admin/incoming/quotes")}
            >
              Quote Requests
            </Typography>

            <Box sx={{
              //backgroundColor: "#6eeb7d",
              height: "33vh",
              width: "25vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "end",
            }}>
              <Box sx={{
                  backgroundColor: "#ffffff",
                  height: "30vh",
                  width: "30vw",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginTop: "13vh",
              }}>
                <Box sx={{ // box holds the text for number of pending appopintments
                  //backgroundColor: "#c67777",
                  height: "30vh",
                  width: "25vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h1" sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main' 
                    }}>
                      {(pendingQuoteCount)}
                    </Typography>
                  )}
                  <Typography 
                    variant="h5" 
                    color="Secondary"
                    sx={{
                      margin: "40px",
                    }}>
                    Quotes
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{
            //backgroundColor: "#ffffff",
            height: "40vh",
            width: "40vw",
          }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#1976d2",
                whiteSpace: "nowrap",
                padding: 2,
                borderBottom: "3px solid",
                borderColor: "#e6e6e6",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { color: "#76bbff" },
              }}
              onClick={() => handleNavigation("/admin/incoming/parts")}
            >
              Part Requests
            </Typography>

            <Box sx={{
              //backgroundColor: "#6eeb7d",
              height: "33vh",
              width: "25vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "end",
            }}>
              <Box sx={{
                  backgroundColor: "#ffffff",
                  height: "30vh",
                  width: "30vw",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  //marginTop: "13vh",
                }}>
                <Box sx={{ // box holds the text for number of pending parts
                  //backgroundColor: "#c67777",
                  height: "30vh",
                  width: "25vw",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h1" sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main' 
                    }}>
                      {(pendingPartCount)}
                    </Typography>
                  )}
                  <Typography 
                    variant="h5" 
                    color="Secondary"
                    sx={{
                      margin: "40px",
                    }}>
                    Parts
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

        </Box>

        <Box sx={{ // box holds upcoming appointments and new review
          //backgroundColor: "#c7adad",
          height: "40vh",
          width: "79vw",
          margin: "10px",
          display: "flex",
          flexDirection: "row",
          gap: 5,
        }}>
          <Box sx={{
            //backgroundColor: "#ffffff",
            height: "40vh",
            width: "50vw",
          }}>
            <Box sx={{
            //backgroundColor: "#d05b5b",
            height: "18%",
            width: "100%",
            display: "flex",
            borderBottom: "3px solid",
            borderColor: "#e6e6e6",
            }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  whiteSpace: "nowrap",
                  padding: 2,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { color: "#76bbff" },
                }}
                onClick={() => handleNavigation("/admin/reviewed")}
              >
                Upcoming Appointments
              </Typography>
            </Box>

            <Box sx={{
              //backgroundColor: "#6eeb7d",
              height: "33vh",
              width: "100%",
              display: "flex",
              justifyContent: "left",
              alignItems: "end",
            }}>
              <Box sx={{
                  backgroundColor: "#ffffff",
                  height: "30vh",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                {loading ? (
                  <Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <DataGrid<ReviewedAppointment>
                    rows={rowsAppoint}
                    columns={columnAppoint}
                    getRowId={(r: ReviewedAppointment) => r._id}
                    disableRowSelectionOnClick
                    disableColumnResize={true} 
                    hideFooter
                    initialState={{
                      sorting: {
                        sortModel: [{ field: 'original', sort: 'asc'}],
                      },
                    }}
                    slots={{
                      noRowsOverlay: () => (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          height: '100%' 
                        }}>
                          <Typography color="textSecondary">
                            No upcoming appointments scheduled.
                          </Typography>
                        </Box>
                      )
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{
          //backgroundColor: "#c48989",
          height: "40vh",
          width: "50vw",
          //display: "flex"
          }}>
            <Box sx={{
            //backgroundColor: "#d05b5b",
            height: "18%",
            width: "100%",
            display: "flex",
            borderBottom: "3px solid",
            borderColor: "#e6e6e6",
            justifyContent: "space-between",
            }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  whiteSpace: "nowrap",
                  padding: 2,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": { color: "#76bbff" },
                }}
                onClick={() => handleNavigation("/admin/review-management")}
              >
                Recent Reviews
              </Typography>
              {/* filter by time ui */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel>Filter by Time</InputLabel>
                  <Select
                    value={timeframe}
                    label="Filter by Time"
                    onChange={(e) => setTimeframe(e.target.value)}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="week">Past Week</MenuItem>
                    <MenuItem value="month">Past Month</MenuItem>
                    <MenuItem value="year">Past Year</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{
              //backgroundColor: "#6eeb7d",
              height: "33vh",
              width: "100%",
              display: "flex",
              justifyContent: "left",
              alignItems: "end",
            }}>
              
              <Box sx={{
                  backgroundColor: "#ffffff",
                  height: "30vh",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                
                {loading ? (
                  <Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
                    <CircularProgress />
                  </Box>
                  ) : ( 
                  <DataGrid<ReviewRow>
                    rows={filteredReviews}
                    getRowId={(r: ReviewRow) => r.id}
                    columns={columnReview}
                    disableRowSelectionOnClick
                    disableColumnResize={true} 
                    hideFooter
                    initialState={{
                      sorting: {
                        sortModel: [{ field: 'date', sort: 'desc'}],
                      },
                    }}
                    slots={{
                      noRowsOverlay: () => (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          height: '100%' 
                        }}>
                          <Typography color="textSecondary">
                            No reviews.
                          </Typography>
                        </Box>
                      )
                    }}
                  />
                )}

                <Dialog open={openReview} onClose={handleCloseReview} fullWidth maxWidth="sm">
                  <DialogTitle>Review Details</DialogTitle>
                  <DialogContent dividers>
                    {activeReview && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {activeReview.name || "Anonymous"}
                          </Typography>

                          <Chip
                            label={activeReview.isVerified ? "Published" : "Not Published"}
                            color={activeReview.isVerified ? "success" : "default"}
                            size="small"
                          />
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Service: <b>{activeReview.service}</b>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Rating: <b>{activeReview.rating}</b>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date: <b>{activeReview.date}</b>
                          </Typography>
                        </Stack>

                        <Divider />

                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Comment
                        </Typography>

                        <Box
                          sx={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            lineHeight: 1.6,
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: "rgba(0,0,0,0.03)",
                          }}
                        >
                          {activeReview.comment || "(no comment)"}
                        </Box>
                      </Box>
                    )}
                  </DialogContent>

                  <DialogActions>
                    <Button onClick={handleCloseReview}>Close</Button>
                  </DialogActions>
                </Dialog>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;