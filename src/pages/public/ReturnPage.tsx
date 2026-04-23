import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Box, Typography, Button } from "@mui/material";
import { NavLink } from "react-router-dom";


function ReturnPage() {
    return(
    <>
        <Navbar />
        {/* Container holds all the content in the outlined box */}
        <Container maxWidth="lg" sx={{ 
            border: '3px solid #dbdbdbff', 
            borderRadius: '8px', 
            padding: 10, 
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
                    width:"50%",
                }}
            >
                <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx ={{
                        textAlign: "left",
                        width:"100%",
                        mb: 2,
                    }}
                >
                    Choose an item to return
                </Typography>

                {/* texts for parts, Future: implement way to checkmark items for return */}
                <Typography variant="h5" fontSize={20} fontWeight="bold"> Part 1</Typography>
                <Typography variant="h5" fontSize={20}> Quantity: 1 <br />Date Ordered: 1/1/25</Typography>

                <Typography> <br /> </Typography>

                {/* texts for parts, Future: implement way to checkmark items for return */}
                <Typography variant="h5" fontSize={20} fontWeight="bold"> Part 2</Typography>
                <Typography variant="h5" fontSize={20}> Quantity: 1 <br />Date Ordered: 1/1/25</Typography>

            </Box> 

            {/* box contains section with continue button */}
            <Box 
                sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: "center",
                alignItems: "left",
                width:"40%",
                }}
            >
                {/* Continue button routes back to homepage for now, Future: button will route to return pdf page*/}
                <Button
                    sx={{
                        fontSize: 20,
                        padding:"12px",
                        borderRadius: "12px",
                        backgroundColor: "black",
                        color: "white",
                        width: "60%",
                    }}
                    variant="contained"
                    component={NavLink}
                    to="/"
                >
                    Continue
                </Button>
                <Typography variant="h5" fontSize={20}> <br/>Return eligible within 30 days of purchase</Typography>

            </Box>
        </Container >
        <Footer />
    </>
    )
}
export default ReturnPage;