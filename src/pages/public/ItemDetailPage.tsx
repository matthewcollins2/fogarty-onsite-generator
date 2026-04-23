import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import noImage from "../../assets/no-image.png";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import axios from "axios";
import { useMemo } from "react";
import { useAuth } from "../../context/Appcontext";
import { auth } from "../../firebase";

export default function ItemDetailPage() {
  const { id, type } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const { currentUser, authReady } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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
    if (!id || !type) return;

    const fetchItem = async () => {
      try {
        const endpoint =
          type === "generator"
            ? `http://localhost:3000/api/generators/${id}`
            : `http://localhost:3000/api/parts/${id}`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Not found");

        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, type]);

  useEffect(() => {
  if (!authReady || !currentUser || !id || !type) return;

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

const handleFavoriteToggle = async () => {
  try {
    if (!authReady || !currentUser || !id || !type) return;

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

if (loading) {
    return (
      <Box mt={10} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Typography align="center" mt={10}>
        Item not found
      </Typography>
    );
  }

  const images = [item.Image_Url, item.Image_Url2, item.Image_Url3, item.Image_Url4, item.Image_Url5].filter(Boolean);

  const displayImages = images.length > 0 ? images : [noImage];

  const inStock = item.Stock > 0;

  return (
    <Box maxWidth="lg" mx="auto" mt={6}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
        Back
      </Button>

      <Box
        mt={4}
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap={4}
        alignItems="flex-start"
      >
        {/* Left side: images */}
        <Box flex={1}>
          <Box position="relative">
            <img
              src={displayImages[imageIndex]}
              alt=""
              onClick={() => window.open(displayImages[imageIndex], "_blank")}
              style={{
                width: "100%",
                borderRadius: 8,
                cursor: "zoom-in",
              }}
            />

            {displayImages.length > 1 && (
              <>
                <IconButton
                  onClick={() =>
                    setImageIndex(
                      (imageIndex - 1 + displayImages.length) % displayImages.length
                    )
                  }
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 10,
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <IconButton
                  onClick={() =>
                    setImageIndex((imageIndex + 1) % displayImages.length)
                  }
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 10,
                    color: "white",
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Right side: text */}
        <Box flex={1}>

          {displayImages.length > 1 && (
            <Box display="flex" gap={1} mt={2} flexWrap="wrap">
              {displayImages.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setImageIndex(i)}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 6,
                    cursor: "pointer",
                    border: imageIndex === i ? "2px solid black" : "none",
                  }}
                />
              ))}
            </Box>
          )}
          <Box
            mt={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <Typography variant="h5">
              {item.name || item.Part_Name}
            </Typography>

            <IconButton
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                boxShadow: 1,
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
          </Box>

          {!inStock && (
            <Typography color="error" mt={1}>
              Currently not available. Call to request restock information.
            </Typography>
          )}

          <Typography mt={2}>
            {item.Description ?? "No description available."}
          </Typography>

          <Typography
            variant="body2"
            color={item.Stock > 0 ? "text.secondary" : "error"}
            mt={2}
          >
            {item.Stock > 0 ? `In stock: ${item.Stock}` : "Currently not available"}
          </Typography>

          <Box mt={4}>
            <Typography fontWeight={600}>Contact Owner</Typography>
            Call or text at (971) 244-2450
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
