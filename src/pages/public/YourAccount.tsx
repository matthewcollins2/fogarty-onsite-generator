import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Box, Typography, Button, type SxProps, type Theme } from "@mui/material";
import { NavLink } from "react-router-dom";

// button style for your orders and login & security
const ButtonStyle: SxProps<Theme> = {
    textDecoration: "underline",
    color: "black",
    textTransform: "none",
    fontSize:20,
    fontWeight: "bold",
    p: 0,
    minWidth: "auto",
    "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "none", 
    },
};

function YourAccount() {
    return(
    <>
        <Navbar />
        {/* Container holds all the content in the outlined box */}
        <Container maxWidth="md" sx={{ 
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
                    gap: 2,
                    width:"90%",
                }}
            >
                {/* text for "Your Account" */}
                <Typography 
                    variant="h4" 
                    fontWeight={700} 
                    sx ={{
                        textAlign: "center",
                        width:"100%",
                        mb: 2,
                    }}
                >
                    Your Account
                </Typography>

                {/* button for "Your Orders" */}
                <Button
                    variant="text"
                    size="large"
                    component={NavLink}
                    to="/YourOrders"
                    sx={ButtonStyle}
                >
                    Your Orders
                </Button>

                <Typography variant="h6" fontSize={20} fontWeight={25}>
                    Track, return, or cancel an order
                </Typography>

                {/* button for "Login & Security" */}
                <Button
                    variant="text"
                    size="large"
                    component={NavLink}
                    to="/UserSettings"
                    sx={ButtonStyle}
                    end
                >
                    Login & Security
                </Button>
                
                <Typography variant="h6" fontSize={20} fontWeight={25}>
                    Edit login, name, phone number, and email
                </Typography>
            </Box>
        </Container>
        <Footer />
    </>
    );
}

export default YourAccount;