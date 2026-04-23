import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Toolbar,
  Alert,
  CircularProgress,
  Stack,
  Switch,
  IconButton,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowId, GridSortModel } from "@mui/x-data-grid";
import CheckIcon from "@mui/icons-material/Check";
import UndoIcon from "@mui/icons-material/Undo";
import AdminNavbar from "./AdminNavbar";
import dayjs from "dayjs";
import Modal from "@mui/material/Modal";

const createdFromObjectId = (id?: string) => {
  if (!id || id.length < 8) return undefined;
  const seconds = parseInt(id.substring(0, 8), 16);
  return new Date(seconds * 1000).toISOString();
};

const modalStyling = {
  position: "absolute",
  inset: 0,
  m: "auto",
  height: "fit-content",
  bgcolor: "white",
  borderRadius: 2,
  p: 4,
  maxWidth: 600,
};

type Quote = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string; // normalize to string for display
  genModel: string;
  genSerialNumber: string;
  additionalInfo: string;
  acknowledged?: boolean;
  createdAt?: string;
};

//Main
export default function QuoteRequests() {
  const [rows, setRows] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [retentionDays, setRetentionDays] = useState("");
  const [retentionSaved, setRetentionSaved] = useState(false);
  const [retentionError, setRetentionError] = useState<string | null>(null);

  // helper to load quotes + retention from server
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [quotesRes, retentionRes] = await Promise.all([
        fetch("http://localhost:3000/api/quotes", { credentials: "include" }),
        fetch("http://localhost:3000/api/pagecontent/quoteRetentionDays", {
          credentials: "include",
        }),
      ]);

      const text = await quotesRes.text();
      let data: Quote[] = [];
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        throw new Error(
          `Expected JSON, got ${quotesRes.headers.get("content-type") || "unknown"} (HTTP ${quotesRes.status})`,
        );
      }

      if (!quotesRes.ok) throw new Error(`HTTP ${quotesRes.status}`);

      if (retentionRes.ok) {
        try {
          const r = await retentionRes.json();
          setRetentionDays(r.content || "");
        } catch {}
      }

      const normalized = data.map((q) => ({
        ...q,
        phoneNumber: (q as any).phoneNumber?.toString?.() ?? "",
        acknowledged: !!q.acknowledged,
        createdAt: q.createdAt ?? createdFromObjectId(q._id),
      }));

      setRows(normalized);
    } catch (e: any) {
      setError(e.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch list once on mount
  useEffect(() => {
    let mounted = true;
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Toggle handler
  const handleToggleAck = async (id: GridRowId, next: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r._id === id ? { ...r, acknowledged: next } : r)),
    );
    try {
      const res = await fetch(
        `http://localhost:3000/api/quotes/${id}/acknowledge`,
        {
          method: "PATCH", // if PATCH isn’t available, change to POST and add matching route
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ acknowledged: next }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      // rollback
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, acknowledged: !next } : r)),
      );
    }
  };

  //Handle Delete of Quote from Web View and Database With Error Checking
  const handleDelete = async (id: GridRowId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quote?",
    );
    if (!confirmed) return; //Exit if admin does not confirm

    setRows((prev) => prev.filter((r) => r._id !== id));
    try {
      const res = await fetch(`http://localhost:3000/api/quotes/${id}`, {
        method: "DELETE", // if PATCH isn’t available, change to POST and add matching route
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      // rollback
      console.error("Could not delete quote");
    }
  };

  //Modal Handle Opening and Closing
  const handleViewOpen = (row: Quote) => {
    setSelectedQuote(row);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedQuote(null);
  };

  const columns: GridColDef<Quote>[] = [
    {
      field: "acknowledged",
      headerName: "Ack",
      type: "boolean",
      minWidth: 110,
      sortable: true,
      renderCell: (params) => {
        const id = params.id as string;
        const ack = Boolean(params.value);
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Switch
              size="small"
              checked={ack}
              onChange={(e) => handleToggleAck(id, e.target.checked)}
            />
            <IconButton
              size="small"
              color={ack ? "success" : "default"}
              onClick={() => handleToggleAck(id, !ack)}
            >
              {ack ? (
                <CheckIcon fontSize="small" />
              ) : (
                <UndoIcon fontSize="small" />
              )}
            </IconButton>
          </Stack>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      minWidth: 160,
      sortable: false, // controller already handles order
      // v6-style valueGetter: (_value, row)
      valueGetter: (_value: string | undefined, row: Quote): string => {
        const iso = row.createdAt ?? createdFromObjectId(row._id);
        return iso && dayjs(iso).isValid()
          ? dayjs(iso).format("MMM DD, YYYY @ h:mm A")
          : "-";
      },
    },

    // Main Quote Page Rows
    { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 220 },
    { field: "phoneNumber", headerName: "Phone", flex: 1, minWidth: 140 },

    //Buttons For View and Delete
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleViewOpen(params.row)}
          >
            View
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  // Put unacknowledged on top
  const sortModel: GridSortModel = [{ field: "acknowledged", sort: "asc" }];

  const saveRetention = async () => {
    setRetentionError(null);
    const num = parseInt(retentionDays);
    if (isNaN(num) || num < 30 || num > 365) {
      setRetentionError("Retention days must be between 30 and 365");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:3000/api/pagecontent/quoteRetentionDays",
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: retentionDays }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRetentionSaved(true);
      setTimeout(() => setRetentionSaved(false), 3000);
      // refresh list so deletion rule takes effect immediately
      loadData();
    } catch (err) {
      setRetentionError("Failed to save retention");
    }
  };

  return (
    <>
      <AdminNavbar />
      <Box sx={{ ml: "13vw", px: 4 }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Quote Requests
        </Typography>
        {/* retention control */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Delete after (days)"
            type="number"
            inputProps={{ min: 30, max: 365 }}
            value={retentionDays}
            onChange={(e) => setRetentionDays(e.target.value)}
            sx={{ width: 250 }}
          />
          <Button variant="contained" onClick={saveRetention}>
            Save
          </Button>
          {retentionSaved && (
            <Typography color="success.main">Saved</Typography>
          )}
          {retentionError && (
            <Typography color="error.main">{retentionError}</Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 600, width: "100%", position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <DataGrid
            rows={rows}
            getRowId={(r) => r._id}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            checkboxSelection={false}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              sorting: { sortModel },
              pagination: { paginationModel: { page: 0, pageSize: 25 } },
            }}
          />
        </Box>
      </Box>

      {/*Modal Code*/}
      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box sx={modalStyling}>
          <Typography variant="h6" gutterBottom>
            Quote Request
          </Typography>

          {selectedQuote && (
            <Stack spacing={1}>
              <Typography>
                <strong>Name:</strong> {selectedQuote.name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedQuote.email}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selectedQuote.phoneNumber}
              </Typography>

              <Typography>
                <strong>Created:</strong>{" "}
                {dayjs(selectedQuote.createdAt).format("MMM DD, YYYY @ h:mm A")}
              </Typography>

              <Typography>
                <strong>Acknowledged:</strong>{" "}
                {selectedQuote.acknowledged ? "Yes" : "No"}
              </Typography>

              {selectedQuote.additionalInfo && (
                <Typography>
                  <strong>Message:</strong> {selectedQuote.additionalInfo}
                </Typography>
              )}
            </Stack>
          )}

          {/* Close and Acknowledge Buttons */}
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button onClick={handleViewClose} variant="contained">
              Close
            </Button>

            <Button
              variant="contained"
              sx={{ ml: 1 }}
              disabled={selectedQuote?.acknowledged}
              onClick={async () => {
                if (!selectedQuote) return;
                await handleToggleAck(selectedQuote._id, true);
                handleViewClose();
              }}
            >
              Acknowledge
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
