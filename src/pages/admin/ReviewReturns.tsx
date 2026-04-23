import { Box } from "@mui/system";
import Navbar from "./AdminNavbar";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

interface ReturnRequest {
  _id: string;
  userID: string;
  name: string;
  email: string;
  generatorModel: string;
  serialNumber: string;
  condition: string;
  reason: string;
  status: string;
  createdAt?: string | null;
}

const statusOptions = ["Completed", "In-Progress", "Denied", "Pending"];

const formatISO = (iso?: string | null) => {
  if (!iso) return "-";
  const dt = dayjs(iso);
  return dt.isValid() ? dt.format("MMM DD, YYYY @ h:mm A") : "-";
};

const ReviewReturns = () => {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"a-z" | "z-a" | "Newest" | "Oldest" | "Status">("Newest");

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<ReturnRequest | null>(null);

    const [openComments, setOpenComments] = useState(false);
    const [buffer1, setBuffer1] = useState(""); 

    const [retentionDays, setRetentionDays] = useState("");
    const [retentionSaved, setRetentionSaved] = useState(false);
    const [retentionError, setRetentionError] = useState<string | null>(null);

    // fetch returns and retention day amount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [returnsRes, retentionRes] = await Promise.all([
                    axios.get<ReturnRequest[]>("http://localhost:3000/api/returns"),
                    axios.get("http://localhost:3000/api/pagecontent/returnRetentionDays")
                ]);
                
                setReturns(returnsRes.data);
                
                if (retentionRes.data) {
                    setRetentionDays(retentionRes.data.content || "");
                }
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Save retention
    const saveRetention = async () => {
        setRetentionError(null);
        const num = parseInt(retentionDays);
        if (isNaN(num) || num < 30 || num > 365) {
            setRetentionError("Retention days must be between 30 and 365");
            return;
        }
        try {
            await axios.put("http://localhost:3000/api/pagecontent/returnRetentionDays", {
                content: retentionDays
            });
            setRetentionSaved(true);
            setTimeout(() => setRetentionSaved(false), 3000);
        } catch (err) {
            setRetentionError("Failed to save retention");
        }
    };

    let sortedRequests = useMemo(() => {
        const filtered = returns.filter((item) => {
            const query = searchQuery.toLowerCase();
            const name = (item.name ?? "").toLowerCase();
            return name.includes(query);
        });

        const copy = [...filtered];
        const getName = (p: ReturnRequest) => p.name ?? "";
        
        // Get time for sorting
        const getTime = (p: ReturnRequest) => p.createdAt ? new Date(p.createdAt).getTime() : 0;
        
        if (sortBy === "a-z") {
            return copy.sort((a, b) => getName(a).localeCompare(getName(b)));
        } else if (sortBy === "z-a") {
            return copy.sort((a, b) => getName(b).localeCompare(getName(a)));
        } else if (sortBy === "Oldest") {
            return copy.sort((a, b) => getTime(a) - getTime(b));
        } else if (sortBy === "Newest") {
            return copy.sort((a, b) => getTime(b) - getTime(a));
        } else if (sortBy === "Status") {
        // Order by status
        const statusWeights: Record<string, number> = {
            "Pending": 1,
            "In-Progress": 2,
            "Denied": 4,
            "Completed": 3
        };
        return copy.sort((a, b) => (statusWeights[a.status] || 99) - (statusWeights[b.status] || 99));
    }
        return copy;
    }, [returns, sortBy, searchQuery]);

    const confirmComments = (request: ReturnRequest) => {
      setBuffer1(request.reason);
      setOpenComments(true);
    };

    const confirmDelete = (request: ReturnRequest) => {
        setRequestToDelete(request);
        setOpenDeleteDialog(true);
    };

    const handleDeleteRequest = async () => {
        if (!requestToDelete) return;
        setOpenDeleteDialog(false);

        try {
          await axios.delete(`http://localhost:3000/api/returns/${requestToDelete._id}`);

          setReturns((prev) =>
              prev.filter((req) => req._id !== requestToDelete._id)
          );
        } catch (err: any) {
          console.error("Error deleting return request:", err);
          setError(`Failed to delete return request: ${requestToDelete.name}.`);
        } finally {
          setRequestToDelete(null);
        }
    };

    const handleUpdateRequest = async (request: ReturnRequest, state: string) => {
      try {
        await axios.put("http://localhost:3000/api/returns/" + request._id, { 
          status: state 
        });

        setReturns(prev => prev.map(r => r._id === request._id ? { ...r, status: state } : r));
      } catch (err: any) {
        console.error("Error updating return request:", err);
        setError(`Failed to update return request: ${request.name}.`);
      }
    };

    return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />

      <Box sx={{ flexGrow: 1, marginLeft: "13vw", p: 8, backgroundColor: "#fafafa" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4, color: "#000000ff" }}>
          Return Requests
        </Typography>

        {/* Retention Control Box */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Delete after (days)"
            type="number"
            inputProps={{ min: 30, max: 365 }}
            value={retentionDays}
            onChange={(e) => setRetentionDays(e.target.value)}
            sx={{ width: 250, backgroundColor: "white" }}
          />
          <Button variant="contained" onClick={saveRetention} sx={{ height: 56 }}>
            Save Retention
          </Button>
          {retentionSaved && (
            <Typography color="success.main" sx={{ fontWeight: "bold" }}>Saved!</Typography>
          )}
          {retentionError && (
            <Typography color="error.main">{retentionError}</Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
          <TextField
            placeholder="Search by name..."
            variant="outlined"
            fullWidth
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />
          <TextField
            select
            label="Sort By:"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            sx={{ width: "30%", backgroundColor: "white", borderRadius: 1 }}
          >
            <MenuItem value="a-z">Name A-Z</MenuItem>
            <MenuItem value="z-a">Name Z-A</MenuItem>
            <MenuItem value="Newest">Newest</MenuItem>
            <MenuItem value="Oldest">Oldest</MenuItem>
            <MenuItem value="Status">Status</MenuItem>
          </TextField>
        </Box>

        <Paper
          elevation={3}
          sx={{
            width: "100%",
            height: "75vh",
            overflowY: "auto",
            p: 3,
            borderRadius: 3,
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: loading ? "center" : "flex-start",
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Serial #</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Condition</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRequests.map((req) => (
                    <TableRow key={req._id} hover>
                      <TableCell>{formatISO(req.createdAt)}</TableCell>
                      <TableCell>{req.name}</TableCell>
                      <TableCell>{req.email}</TableCell>
                      <TableCell>{req.generatorModel}</TableCell>
                      <TableCell>{req.serialNumber}</TableCell>
                      <TableCell>{req.condition}</TableCell>
                      <TableCell>
                        <Button variant="outlined" onClick={() => confirmComments(req)}>
                          View Reason
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={req.status}
                          onChange={(e) => handleUpdateRequest(req, e.target.value)}
                          input={<OutlinedInput label="State" />}
                        >
                          {statusOptions.map((state) => (
                            <MenuItem key={state} value={state}>
                              {state}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="outlined" color="error" onClick={() => confirmDelete(req)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sortedRequests.length === 0 && (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    No return requests found.
                  </Typography>
                </Box>
              )}
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Reason Popup */}
      <Dialog open={openComments} onClose={() => setOpenComments(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Return Reason</DialogTitle>
        <DialogContent>
          <Typography component="span">{buffer1}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenComments(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the return request for: 
            <Typography component="span" sx={{ fontWeight: "bold", ml: 1 }}>
              {requestToDelete?.name}?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteRequest} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReviewReturns;