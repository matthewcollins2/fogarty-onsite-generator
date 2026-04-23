import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Toolbar, CircularProgress, Alert, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,Stack, Divider, } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import AdminNavbar from "./AdminNavbar";
import dayjs from "dayjs";
import { auth } from "../../firebase"; // Firebase token


interface ReviewedAppointment {
  _id: string;
  appointmentDateTime: string;
  appointmentEndDateTime: string;
  newAppointmentTime?: string | null;
  newAppointmentEndTime?: string | null;
  status: "accepted" | "denied" | "rescheduled";
  name: string;
  phone: string;
  email: string; 
  address: string;
  description: string;  
  rescheduledDateTime?: string | null;
  rescheduledEndDateTime?: string | null;
  createdBy: string;
}

const formatISO = (iso?: string | null) => {
  if (!iso) return "-";
  const dt = dayjs(iso);
  return dt.isValid() ? dt.format("MMM DD, YYYY @ h:mm A") : "-";
};
const formatRange = (start?: string | null, end?: string | null) => {
  if (!start) return "-";
  const s = dayjs(start);
  if (!s.isValid()) return "-";

  // fallback end = start + 1 hour (in case older rows don’t have end stored)
  const e = end ? dayjs(end) : s.add(1, "hour");
  const endToUse = e.isValid() && e.isAfter(s) ? e : s.add(1, "hour");


  return `${s.format("MMM DD, YYYY")} @ ${s.format("h:mm A")} - ${endToUse.format("h:mm A")}`;
};

const getEffectiveStartEnd = (row: ReviewedAppointment) => {
  const scheduledStart =
    row.status === "rescheduled" ? row.rescheduledDateTime : row.appointmentDateTime;

  const scheduledEnd =
    row.status === "rescheduled"
      ? row.rescheduledEndDateTime ?? row.appointmentEndDateTime
      : row.appointmentEndDateTime;

  return { scheduledStart, scheduledEnd };
};

export default function ReviewedAppointments() {
  const [rows, setRows] = useState<ReviewedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

    // View dialog state
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ReviewedAppointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openDialog = (row: ReviewedAppointment) => {
    setActive(row);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setActive(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/appointments/reviewed");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load appointments");

        // Ensure data is an array before setting state
        setRows(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const deleteSchedule = async (id: string) => {
    const ok = window.confirm("Delete this scheduled appointment? This cannot be undone.");
    if (!ok) return;

    try {
      setError("");

      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`http://localhost:3000/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      // remove from UI
      setRows((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete appointment");
    }
  };

  const columns: GridColDef<ReviewedAppointment>[] = [
    {
      field: "view",
      headerName: "View",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" onClick={() => openDialog(params.row)}>
          View
        </Button>
      ),
    },
    {
      field: "scheduleDate", // Matched to the actual data key
      headerName: "Scheduled Date",
      flex: 1.3,
      minWidth: 270,
      valueGetter: (_v, row) => {
      const { scheduledStart, scheduledEnd } = getEffectiveStartEnd(row);
      return formatRange(scheduledStart, scheduledEnd);
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const s = params.value?.toLowerCase() ?? "unknown";
        const color =
          s === "accepted"
            ? "success"
            : s === "denied"
            ? "error"
            : s === "rescheduled"
            ? "warning"
            : "default";

        return <Chip label={s.toUpperCase()} color={color as any} size="small" />;
      }
    },
    {
      field: "originalDate", // Matched to the actual data key
      headerName: "Original Date (If Rescheduled)",
      flex: 1.4,
      minWidth: 200,
      valueGetter: (_value, row) => formatISO(row.status === "rescheduled" ? row.appointmentDateTime : "-"),
    },
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 130 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 180 },
    { field: "address", headerName: "Address", flex: 1.5, minWidth: 200 },
    {
      field: "Delete",
      headerName: "Delete",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => deleteSchedule(row._id)}
          >
            Delete
          </Button>
        );
      },
    },
  ];
   // Dialog computed values
  const dialogMeta = useMemo(() => {
    if (!active) return null;
    const { scheduledStart, scheduledEnd } = getEffectiveStartEnd(active);

    const scheduledRange = formatRange(scheduledStart, scheduledEnd);
    const originalRange =
      active.status === "rescheduled"
        ? formatRange(active.appointmentDateTime, active.appointmentEndDateTime ?? null)
        : "-";

    const createdBy = (active.createdBy ?? "user").toLowerCase();

    return { scheduledRange, originalRange, createdBy };
  }, [active]);

  return (
    <>
      <AdminNavbar />
      {/* ml: "13vw" matches your sidebar width */}
      <Box sx={{ ml: "13vw", p: 4, width: "calc(100% - 15vw)" }}>
        <Toolbar />

        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Reviewed Appointments
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          height: 700, 
          width: "100%", 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          boxShadow: 2,
          overflow: 'hidden' 
        }}>
          {loading ? (
            <Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(r) => r._id}
              disableRowSelectionOnClick
              density="comfortable"
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } }
              }}
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            />
          )}
        </Box>
      </Box>
       {/* VIEW DIALOG */}
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>Appointment Details</DialogTitle>

        <DialogContent dividers>
          {!active || !dialogMeta ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Header */}
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {active.name || "Unknown"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created By: <b>{dialogMeta.createdBy}</b>
                  </Typography>
                </Box>

                <Chip
                  label={active.status.toUpperCase()}
                  color={
                    active.status === "accepted"
                      ? "success"
                      : active.status === "denied"
                      ? "error"
                      : "warning"
                  }
                  size="small"
                />
              </Stack>

              <Divider />

              {/* Schedule */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Scheduled Time
                </Typography>
                <Typography variant="body2">{dialogMeta.scheduledRange}</Typography>

                {active.status === "rescheduled" && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1 }}>
                      Original Time
                    </Typography>
                    <Typography variant="body2">{dialogMeta.originalRange}</Typography>
                  </>
                )}
              </Box>

              <Divider />

              {/* Contact */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Contact
                </Typography>
                <Typography variant="body2">
                  Email: <b>{active.email || "-"}</b>
                </Typography>
                <Typography variant="body2">
                  Phone: <b>{active.phone || "-"}</b>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Address: <b>{active.address || "-"}</b>
                </Typography>
              </Box>

              <Divider />

              {/* Description */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Issue Description
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "rgba(0,0,0,0.03)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: 1.6,
                  }}
                >
                  {active.description || "(no description)"}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}