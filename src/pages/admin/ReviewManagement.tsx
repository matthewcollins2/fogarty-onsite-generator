import React, { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { CircularProgress, Stack, Typography, Box, Button, Alert  } from "@mui/material";
import Navbar from "./AdminNavbar";
import { Switch } from "@mui/material";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import { Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider, } from "@mui/material";

type ReviewRow = {
      id: string;
      name: string;
      rating: string | number;
      comment: string;
      date: string;
      isVerified: boolean;
      service: string;
};
//unit testing for average rating calculation
const calcVerifiedAverage = (rows: { rating: any; isVerified: boolean }[]) => {
  const nums = rows
    .filter((r) => r.isVerified)
    .map((r) => Number(r.rating))
    .filter((n) => Number.isFinite(n));

  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

// admin review management page
function ReviewManagement() {

  //testing
  useEffect(() => {
  const testRows = [
    { rating: 5, isVerified: true },
    { rating: 1, isVerified: false },
    { rating: 1, isVerified: true },
    { rating: 4.5, isVerified: true },
  ];
  const result = calcVerifiedAverage(testRows);
  console.log("[MANUAL TEST] avg verified should be 3.5 ->", result);
  }, []);

    //for selected tracks
    const [selectionModel, setSelectionModel] = useState<string[]>([]);
    const selectedIds = selectionModel;
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rowsLoaded, setRowLoaded] = useState(false); 
    const [rows, updateRows] = useState<ReviewRow[]>([]);

    //simple statistics, total reviews, verified reviews, avg score
    const totalReviews = rows.length;
    const verifiedReviews = rows.filter((r) => r.isVerified);
    const verifiedCount = verifiedReviews.length;
    const avgVerified = verifiedCount === 0 ? 0 : verifiedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / verifiedCount;
    const avgVerifiedDisplay = verifiedCount === 0 ? "-" : avgVerified.toFixed(2);

    //view card
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


    const handleToggleVerified = async (id: string, next: boolean) => {
      updateRows((prev) => prev.map((r) => (r.id === id ? { ...r, isVerified: next } : r)));

      // if it became verified, remove it from delete selection
      if (next) setSelectionModel((prev) => prev.filter((x) => x !== id));

      try {
        const res = await fetch(`http://localhost:3000/api/reviews/${id}/verified`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ verified: next }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
      } catch (e) {
        // rollback
        updateRows((prev) => prev.map((r) => (r.id === id ? { ...r, isVerified: !next } : r)));
        setError("Failed to update verified status");
      }
    };

    const normalizeSelectionToIds = (model: any): string[] => {
      if (Array.isArray(model)) return model.map(String);
      if (model instanceof Set) return Array.from(model).map(String);
      if (model?.ids) return Array.from(model.ids).map(String);
      return [];
    };

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
    updateRows(tmp);
    setRowLoaded(true);
  };

  useEffect(() => {
    (async () => {
      try {
        setRowLoaded(false);
        setError(null);
        await getReviews(); 
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        setError(err.message || "Failed to load reviews");
        setRowLoaded(true);
      }
    })();
  }, []);

  // deletes the selected reviews
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const ok = window.confirm(`Delete ${selectedIds.length} review(s)? This cannot be undone.`);
    if (!ok) return;

    setDeleting(true);
    setError(null);

    try {
      // Fire deletes in parallel
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`http://localhost:3000/api/reviews/${id}`, {
            method: "DELETE",
            credentials: "include",
          }).then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`Failed to delete ${id}: HTTP ${res.status} ${text}`);
            }
          })
        )
      );
      //updates the rows to reflect the deleted reviews
      updateRows((prev) => prev.filter((r) => !selectedIds.includes(r.id )));
      setSelectionModel([]);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to delete selected reviews");
    } finally {
      setDeleting(false);
    }
  };

  // column headings for table
  const columns: GridColDef[] = [
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
      { field: "date", headerName: "Date Created", width: 150, editable: false },
      //update on veriified toggle
      {
        field: "isVerified",
        headerName: "Published",
        width: 140,
        sortable: false,
        renderCell: (params: GridRenderCellParams<any>) => {
          const id = String(params.id);
          const checked = Boolean(params.value);

          return (
            <Switch
              size="small"
              checked={checked}
              onChange={(e) => handleToggleVerified(id, e.target.checked)}
            />
          );
        },
      },
      { field: "service", headerName: "Service", width: 200, editable: false },
      { field: "comment", headerName: "Review", width: 550, editable: false },
      
    ];

  return ( 
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      <Navbar />
      <Box
          sx={{ flexGrow: 1, marginLeft: "13vw", p: 8, backgroundColor: "#fafafa", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 4, color: "#000000ff" }}
        >
          Review Management
        </Typography>

        {/* Delete button and tip*/}
        <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            color="error"
            disabled={selectedIds.length === 0 || deleting}
            onClick={handleDeleteSelected}
          >
            {deleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
          </Button>
          {!deleting && selectedIds.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Tip: select rows using the checkboxes on the left.
            </Typography>
          )}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>

          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "white", boxShadow: 1, minWidth: 180 }}>
            <Typography variant="body2" color="text.secondary">All Reviews</Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>{totalReviews}</Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "white", boxShadow: 1, minWidth: 180 }}>
            <Typography variant="body2" color="text.secondary">Published Reviews</Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>{verifiedCount}</Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "white", boxShadow: 1, minWidth: 260 }}>
            <Typography variant="body2" color="text.secondary">Avg Published Rating</Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>{avgVerifiedDisplay}</Typography>
          </Box>

        </Stack>

        <Box sx = {{ flex: 1, pb: 3, minHeight:0}}>
          {/* Table settings */}
          <div>
          {
            rowsLoaded ? 
            <DataGrid
              style={{ height: '80vh' }}
              rows={rows}
              columns={columns}
              checkboxSelection
              isRowSelectable={(params) => !params.row.isVerified}
              onRowSelectionModelChange={(newSelection) => setSelectionModel(normalizeSelectionToIds(newSelection))}
              getEstimatedRowHeight={() => 200}
              getRowHeight={() => 'auto'} 
              hideFooterPagination={true}
              sx={{
                '& ,MuiDataGrid-VirtualScroller': { paddingBottom: '70px' },
                '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': {py: 1},
                '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': {py: '15px',},
                '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': {py: '22px',},
              }}
              pageSizeOptions={[5]}
              disableRowSelectionOnClick
            />
            :
            //While it is fetching the data a loading icon appears
            <Stack direction="row" spacing={20} sx={{justifyContent: "center", alignItems: "center"}}>
              <CircularProgress color="inherit" />
            </Stack>
            
          }
          </div>
        </Box>
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
  );
}

export default ReviewManagement;