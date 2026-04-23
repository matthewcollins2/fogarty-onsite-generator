
import Navbar from "./AdminNavbar";
import { Box, Container, Fab, Typography } from '@mui/material';
import ItemTabs from './ItemTabs';

// admin inventory management page
function InventoryManagement() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />
      <Box
          sx={{ flexGrow: 1, marginLeft: "13vw", p: 8, backgroundColor: "#fafafa" }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 4, color: "#000000ff" }}
        >
          Inventory Management
        </Typography>
        <Box 
          sx={{
          position: "relative",
          }}
        >
        {/* allows user to switch between the generator table and parts table */}
        <ItemTabs></ItemTabs>
        </Box>
      </Box>
    </Box>
  );
}

export default InventoryManagement;