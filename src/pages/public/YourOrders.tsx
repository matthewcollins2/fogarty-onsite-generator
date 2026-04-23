import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Box, Typography, Button, type SxProps, type Theme } from "@mui/material";
import { NavLink } from "react-router-dom";

// button style for "Return"
const ButtonStyle: SxProps<Theme> = {
    textDecoration: "underline",
    color: "black",
    textTransform: "none",
    fontSize:20,
    p: 0,
    minWidth: "auto",
    "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "none", 
    },
};

function YourOrders() {
    return(
    <>
        <Navbar />
        {/* Container holds all the content in the outlined box */}
        <Container maxWidth="lg" sx={{ 
            border: '3px solid #dbdbdbff', 
            borderRadius: '8px', 
            padding: 8, 
            pb: 20,
            mt: 15, 
            mb: 15,
            display: "flex",
            justifyContent: "center",
        }}>
            <Box 
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: "flex-start",
                    width:"90%",
                }}
            >
                {/* text for "your orders" */}
                <Typography 
                    variant="h4" 
                    fontWeight={700} 
                    sx ={{
                        textAlign: "center",
                        width:"100%",
                        mb: 2,
                    }}
                >
                    Your Orders
                </Typography>

                {/* texts for parts */}
                <Typography variant="h5" fontSize={20} fontWeight="bold"> Part 1</Typography>
                <Typography variant="h5" fontSize={20}> Quantity: 1 <br />Date Ordered: 1/1/25</Typography>

                <Button
                    variant="text"
                    size="large"
                    component={NavLink}
                    to="/ReturnPage"
                    sx={ButtonStyle}
                >
                    Return
                </Button>

                <Typography> <br /> </Typography>
                {/* texts for parts */}
                <Typography variant="h5" fontSize={20} fontWeight="bold"> Part 2</Typography>
                <Typography variant="h5" fontSize={20}> Quantity: 1 <br />Date Ordered: 1/1/25</Typography>

                {/* Return button routes to ReturnPage */}
                <Button
                    variant="text"
                    size="large"
                    component={NavLink}
                    to="/ReturnPage"
                    sx={ButtonStyle}
                >
                    Return
                </Button>


            </Box>
        </Container>
        <Footer />
    </>
    )

}
export default YourOrders;