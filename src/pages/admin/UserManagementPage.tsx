import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
} from "@mui/material";
import Navbar from "./AdminNavbar";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { auth } from "../../firebase";

interface User {
  _id: string;
  name: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  address: Address;
  role: "user" | "admin";
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipcode: string;
}

const formatAddress = (addr: Address) => {
  if (!addr) return "No address";
  if (typeof addr === "string") return addr || "No address";
  const parts = [addr.street, addr.city, addr.state, addr.zipcode].filter(Boolean);
  return parts.length ? parts.join(", ") : "No address";
};

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"a-z" | "z-a" | "none">("a-z");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to get fresh Firebase Token
  const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user found");
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get<User[]>("http://localhost:3000/api/users", { headers });
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please check your admin permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    try {
      const headers = await getAuthHeaders();
      // This sends the update to your backend
      await axios.patch(
        `http://localhost:3000/api/users/${userId}/role`,
        { role: newRole },
        { headers }
      );

      // This updates the table locally so you see the change immediately
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update user role.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const headers = await getAuthHeaders();
      // Only call your own API. The backend handles the rest.
      await axios.delete(`http://localhost:3000/api/users/${userToDelete._id}`, { headers });

      // Update local state only after a confirmed success
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userToDelete._id));

    } catch (err: any) {
      console.error("Delete failed:", err);
      setError("Failed to delete user. Check server logs.");
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const sortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const query = searchQuery.toLowerCase();
      const name = (user.name ?? user.fullname ?? "").toLowerCase();
      return name.includes(query);
    });

    const copy = [...filtered];
    const getName = (u: User) => (u.name || u.fullname || "").toLowerCase();

    if (sortBy === "a-z") {
      return copy.sort((a, b) => getName(a).localeCompare(getName(b)));
    } else if (sortBy === "z-a") {
      return copy.sort((a, b) => getName(b).localeCompare(getName(a)));
    }
    return copy;
  }, [users, sortBy, searchQuery]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />

      <Box sx={{ flexGrow: 1, marginLeft: "13vw", p: 8, backgroundColor: "#fafafa" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4, color: "#000" }}>
          User Management
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
          <TextField
            placeholder="Search users..."
            variant="outlined"
            fullWidth
            value={searchQuery}
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
            alignItems: loading ? "center" : "stretch",
            justifyContent: loading ? "center" : "flex-start",
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
              <Button variant="contained" onClick={fetchUsers}>Retry</Button>
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>{user.name || user.fullname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber || "N/A"}</TableCell>
                      <TableCell>{formatAddress(user.address)}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={user.role || "user"}
                          onChange={(e) => handleRoleChange(user._id, e.target.value as "user" | "admin")}
                          sx={{
                            minWidth: 100,
                            fontWeight: user.role === 'admin' ? 'bold' : 'normal',
                            color: user.role === 'admin' ? 'primary.main' : 'inherit'
                          }}
                        >
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => confirmDelete(user)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sortedUsers.length === 0 && !loading && (
                <Typography sx={{ textAlign: "center", p: 4 }} color="textSecondary">
                  No users found matching your search.
                </Typography>
              )}
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Updated Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        disableRestoreFocus // <--- THIS FIXES THE ARIA-HIDDEN ERROR
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{userToDelete?.name || userToDelete?.fullname}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={isDeleting} // Prevents double-clicks
          >
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;