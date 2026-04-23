import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useEffect, useMemo, useState } from "react";
import noImage from "../../assets/no-image.png";
import { useAuth } from "../../context/Appcontext"; // 1. Import your global context
import { auth } from "../../firebase"; 
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import axios from "axios";

interface StockCardProps {
  id: string;
  type: "generator" | "part";
  title: string;
  stock: number;
  images?: string[];
}

export default function StockCard({
  id,
  type,
  title,
  stock,
  images,
}: StockCardProps) {
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const {currentUser, authReady} = useAuth();

  const displayImages = images && images.length > 0 ? images : [noImage];
  const previewImage = displayImages[imageIndex];
 
const api = useMemo(
  () =>
    axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",
      withCredentials: true,
    }),
  []
);

useEffect(() => {
  const interceptorId = api.interceptors.request.use(async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);
    }
    return config;
  });

  return () => api.interceptors.request.eject(interceptorId);
}, [api]);

useEffect(() => {
  if (!authReady || !currentUser) return;

  const loadFavoriteStatus = async () => {
    try {
      const res = await api.get("/users/favorites");

      const favorites = res.data || [];
      const found = favorites.some(
        (fav: { itemId: string; itemType: string }) =>
          fav.itemId === id && fav.itemType === type
      );

      setIsFavorited(found);
    } catch (err: any) {
      console.error(
        "favorites fetch failed:",
        err?.response?.status,
        err?.response?.data || err.message
      );
    }
  };

  loadFavoriteStatus();
}, [authReady, currentUser, id, type, api]);

const handleFavoriteToggle = async (
  e: React.MouseEvent<HTMLButtonElement>
) => {
  e.stopPropagation();

  try {
    if (!authReady || !currentUser) return;

    setFavoriteLoading(true);

    const res = await api.patch("/users/favorites/toggle", {
      itemId: id,
      itemType: type,
    });

    setIsFavorited(res.data.favorited);
  } catch (err: any) {
    console.error(
      "favorite toggle failed:",
      err?.response?.status,
      err?.response?.data || err.message
    );
  } finally {
    setFavoriteLoading(false);
  }
};

  return (
    <Card
      onClick={() => navigate(`/item/${type}/${id}`)}
      sx={{
        width: 280,
        height: 340,
        cursor: "pointer",
        borderRadius: 3,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "transform 0.2s",
        position: "relative",
        "&:hover": { transform: "scale(1.03)" },
      }}
    >
       {/* Favorite Star */}
        <IconButton
          onClick={handleFavoriteToggle}
          disabled={favoriteLoading}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: "rgba(255,255,255,0.9)",
            opacity: 1,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,1)",
            },
          }}
        >
          {isFavorited ? (
            <StarIcon sx={{ color: "gold" }} />
          ) : (
            <StarBorderIcon sx={{ color: "#222" }} />
          )}
        </IconButton>

      {/* Image Section */}
      <Box sx={{ position: "relative" }}>
        <Box
          component="img"
          src={previewImage || noImage}
          alt={title}
          sx={{
            height: 200,
            width: "100%",
            objectFit: "cover",
          }}
        />

          {displayImages.length > 1 && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setImageIndex(
                    (prev) => (prev - 1 + displayImages.length) % displayImages.length
                  );
                }}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 8,
                  transform: "translateY(-50%)",
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setImageIndex(
                    (prev) => (prev + 1) % displayImages.length
                  );
                }}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 8,
                  transform: "translateY(-50%)",
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
      </Box>

      {/* Info Section */}
      <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
        <Typography fontWeight={600}>{title}</Typography>

        <Typography
          variant="body2"
          color={stock > 0 ? "text.secondary" : "error"}
        >
          {stock > 0 ? `In stock: ${stock}` : "Currently not available"}
        </Typography>
      </CardContent>
    </Card>
  );
}
