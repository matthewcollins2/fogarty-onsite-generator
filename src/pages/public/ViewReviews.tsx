import { useState, useEffect } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import {Box, Typography, Container, TextField, MenuItem, Grid, Card,CardContent} from "@mui/material";
import { Star } from "@mui/icons-material";

interface Review {
  _id: string;
  service: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: string;
}

interface StarRatingProps {
  rating: number;
}

const StarRating = ({rating}: StarRatingProps) => {
  return (
    <div style={{display: "flex", gap: "2px"}}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          sx={{color: i < rating ? "#FFC107" : "#E0E0E0",fontSize: 18,}}
        />
      ))}
    </div>
  );
};

function ViewReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortOption, setSortOption] = useState("high-low");

  // Fetch Reviews
  useEffect(() => {
    fetch("http://localhost:3000/api/reviews")
      .then((res) => res.json())
      .then((data: Review[]) => setReviews(data))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  const verifiedReviews = reviews.filter((rev) => rev.verified);

  // Sort Reviews
  const filteredReviews = verifiedReviews.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    switch (sortOption) {
      case "low-high":
        return a.rating - b.rating;
      case "newest":
        return dateB - dateA;
      case "oldest":
        return dateA - dateB;
      case "high-low":
      default:
        return b.rating - a.rating;
    }
  });

  return (
    <>
      <Navbar />

      {/* Main Container */}
      <Container maxWidth="lg" sx={{mt: 15, mb: 10}}>
        {/* Outer Grid like FAQ page */}
        <Grid container spacing={0} alignItems="left">
          <Grid size={{xs: 12}}>
            {/* Page Title */}
            <Typography
              variant="h3"
              fontWeight={700}
              gutterBottom
              align="center"
              sx={{mb: 6}}
            >
              Reviews
            </Typography>

            {/* Search + Sort Section */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                mb: 6,
              }}
            >
              <TextField
                select
                label="Sort By"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                sx={{ width: "40%" }}
              >
                <MenuItem value="high-low">Rating: High → Low</MenuItem>
                <MenuItem value="low-high">Rating: Low → High</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
              </TextField>
            </Box>

            {/* Reviews Grid */}
            <Grid container spacing={4}>
              {filteredReviews.length === 0 ? (
                <Typography>No reviews available</Typography>
              ) : (
                filteredReviews.map((rev) => (
                  <Grid size={{xs: 12, sm: 6, md: 4}} key={rev._id}>
                    <Card
                      sx={{
                        boxShadow: 3,
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                      }}
                    >
                      <CardContent>
                        <Typography fontWeight={600}>{rev.service}</Typography>

                        <Box sx={{my: 1}}>
                          <StarRating rating={rev.rating} />
                        </Box>

                        <Typography sx={{mb: 2}}>{rev.comment}</Typography>

                        <Typography color="text.secondary">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </>
  );
}

export default ViewReviews;