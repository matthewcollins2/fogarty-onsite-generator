import { Box } from "@mui/system";
import Navbar from "./AdminNavbar";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, OutlinedInput, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

interface PartsRequest {
  _id:          string;
  name:         string;
  email:        string;
  phoneNumber:  string;
  address:      string;
  partName:     string;
  AdditionalInformation:     string;
  status:       string;
  createdAt?:   Date | null;
}

// Completed: Part is shipping or has arrived
// In-Progress: Viewed the request, Client is talking to the customer, part hasn't shipped
// To-do: Not viewed the request, Client has not talked to the customer
// Canceled: Client has canceled the request for the part
const status = ["Completed", "In-Progress", "To-do", "Denied"];

// Formats the Date
const formatISO = (iso?: string | null) => {
  if (!iso) return "-";
  const dt = dayjs(iso);
  return dt.isValid() ? dt.format("MMM DD, YYYY @ h:mm A") : "-";
};

const PartsRequest = () => {
    const [partsRequests, setPartsRequests] = useState<PartsRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add search state
    const [searchQuery, setSearchQuery] = useState("");
    // Add sort state
    const [sortBy, setSortBy] = useState<"a-z" | "z-a" | "Newest" | "Oldest" | "none">("Newest");

    // State for the delete confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<PartsRequest | null>(null);

    // State for comment dialog
    const [openComments, setOpenComments] = useState(false);
    const [buffer1, setBuffer1] = useState(""); // keep track of comments

    // Gets the part requests
    useEffect(() => {
        const fetchPartRequests = async () => {
        try {
            const response = await axios.get<PartsRequest[]>(
            "http://localhost:3000/api/partrequests"
            );
            setPartsRequests(response.data);
        } catch (err: any) {
            console.error("Error fetching parts requests:", err);
            setError("Failed to load parts requests. Please try again later.");
        } finally {
            setLoading(false);
        }
        };

        fetchPartRequests();
    }, []);


    // Derive a sorted copy (non-mutating)
    let sortedRequests = useMemo(() => {
    const filtered = partsRequests.filter((partsRequest) => {
        const query = searchQuery.toLowerCase();
        const name = (partsRequest.name ?? "").toLowerCase();
        return name.includes(query);
    });

    const copy = [...filtered];
    const getName = (p: PartsRequest) => p.name ?? "";
    const getDate = (p: PartsRequest) => p.createdAt?.toString() ?? "";
    if (sortBy === "a-z") {
        return copy.sort((a, b) => getName(a).localeCompare(getName(b)));
    } else if (sortBy === "z-a") {
        return copy.sort((a, b) => getName(b).localeCompare(getName(a)));
    } else if (sortBy === "Oldest") {
      return copy.sort((a, b) => getDate(a).localeCompare(getDate(b)));
    } else if (sortBy === "Newest") {
      return copy.sort((a, b) => getDate(b).localeCompare(getDate(a)));
    }
    return copy;
    }, [partsRequests, sortBy, searchQuery]);

    const confirmComments = (partsRequest: PartsRequest) => {
      setBuffer1(partsRequest.AdditionalInformation)
      setOpenComments(true);
    }


    // 1. Open Dialog function
    const confirmDelete = (partsRequest: PartsRequest) => {
        setRequestToDelete(partsRequest);
        setOpenDeleteDialog(true);
    };

    // 2. Handle API Call and State Update
    const handleDeleteRequest = async () => {
        if (!requestToDelete) return;

        // Close the dialog and show loading (optional, for visual feedback)
        setOpenDeleteDialog(false);

        try {
          // API call to delete the request by ID
          await axios.delete(`http://localhost:3000/api/partrequests/${requestToDelete._id}`);

          // SUCCESS: Update the local state by filtering out the deleted user
          setPartsRequests((prevRequests) =>
              prevRequests.filter((reqs) => reqs._id !== requestToDelete._id)
        );

        console.log(`Part request ${requestToDelete.name} deleted successfully.`);
        } catch (err: any) {
        console.error("Error deleting part request:", err);
        // Handle error display
        setError(`Failed to delete part request: ${requestToDelete.name}.`);
        } finally {
        setRequestToDelete(null); // Clear the user being tracked
        }
    };

    const handleUpdateRequest = async (partRequest: PartsRequest, state: string) => {
      partRequest.status = state;
      try {
        // API call to update the request by ID
        await fetch("http://localhost:3000/api/partrequests/" + partRequest._id, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({status: state}),
        });
        } catch (err: any) {
          console.error("Error updating part request:", err);
          // Handle error display
          setError(`Failed to update part request: ${partRequest.name}.`);
        }
    }


    return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />

      <Box sx={{ flexGrow: 1, marginLeft: "13vw", p: 8, backgroundColor: "#fafafa" }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 4, color: "#000000ff" }}
        >
          Parts Request
        </Typography>

        {/* Search + Sort Bar: */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            placeholder="Search..."
            variant="outlined"
            fullWidth
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />
          <TextField
            select
            label="Sort By:"
            value={sortBy} // use state
            onChange={(e) => setSortBy(e.target.value as any)}
            sx={{ width: "30%", backgroundColor: "white", borderRadius: 1 }}
          >
            <MenuItem value="a-z">Name A-Z</MenuItem>
            <MenuItem value="z-a">Name Z-A</MenuItem>
            <MenuItem value="Newest">Newest</MenuItem>
            <MenuItem value="Oldest">Oldest</MenuItem>
            <MenuItem value="none">None</MenuItem>
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
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Phone Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Address
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Part
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Comments
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      Delete
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRequests.map((partsRequest) => (
                    <TableRow key={partsRequest._id} hover>
                      <TableCell>{formatISO(partsRequest.createdAt?.toString())}</TableCell>
                      <TableCell>{partsRequest.name}</TableCell>
                      <TableCell>{partsRequest.email}</TableCell>
                      <TableCell>{partsRequest.phoneNumber}</TableCell>
                      <TableCell>{partsRequest.address}</TableCell>
                      <TableCell>{partsRequest.partName}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => confirmComments(partsRequest)}
                        >
                          View Comments
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={partsRequest.status}
                          onChange={(e) => handleUpdateRequest(partsRequest, e.target.value)}
                          input={<OutlinedInput label="State" />}
                        >
                          {status.map((state) => (
                            <MenuItem key={state} value={state} >
                              {state}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => confirmDelete(partsRequest)}
                        >
                          Delete Request
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sortedRequests.length === 0 && (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    No requests found matching your criteria.
                  </Typography>
                </Box>
              )}
            </TableContainer>
          )}
        </Paper>
      </Box>
      {/* View Comments Dialog */}
      <Dialog
        open={openComments}
        onClose={() => setOpenComments(false)}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle id="dialog-title" sx={{ fontWeight: "bold" }}>{"Comments"}</DialogTitle>
        <DialogContent>
          <Typography component="span">
              {buffer1}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenComments(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* User Deletion Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to permanently delete the request:
            <Typography component="span" sx={{ fontWeight: "bold" }}>
              {requestToDelete?.name}?
            </Typography>
            <p>This action cannot be undone.</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteRequest}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PartsRequest;