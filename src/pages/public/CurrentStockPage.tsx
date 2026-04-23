import { useState, useEffect, useMemo } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  Container,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import logo from "../../assets/logo.png";
import StockCard from "../public/StockCard";
import { useAuth } from "../../context/Appcontext"; // 1. Import your global context
import { auth } from "../../firebase";
import axios from "axios";

interface Generator {
  _id: string;
  name?: string;
  Description?: string;
  Stock: number;
  Image_Url?: string;
  Image_Url2?: string;
  Image_Url3?: string;
  Image_Url4?: string;
  Image_Url5?: string;
}

interface Part {
  _id: string;
  Part_Name?: string;
  Stock: number;
  Image_Url?: string;
  Image_Url2?: string;
  Image_Url3?: string;
  Image_Url4?: string;
  Image_Url5?: string;
}

function CurrentStockPage() {
  const [generators, setGenerators] = useState<Generator[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [favorites, setFavorites] = useState<{ itemId: string; itemType: string }[]>([]);
  const { currentUser, authReady } = useAuth();

  const ITEMS_PER_PAGE = 10;
  const [generatorPage, setGeneratorPage] = useState(1);
  const [partPage, setPartPage] = useState(1);

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

  const fetchFavorites = async () => {
    try {
      const res = await api.get("/users/favorites");
      setFavorites(res.data || []);
    } catch (err: any) {
      console.error(
        "favorites fetch failed:",
        err?.response?.status,
        err?.response?.data || err.message
      );
      setFavorites([]);
    }
  };

  fetchFavorites();
}, [authReady, currentUser, api]);

const favoriteSet = new Set(
  favorites.map((fav) => `${fav.itemType}:${fav.itemId}`)
);

  // Fetch Generators
  useEffect(() => {
    fetch("http://localhost:3000/api/generators")
      .then((res) => res.json())
      .then((data) => setGenerators(data))
      .catch((err) => console.error("Error fetching generators:", err));
  }, []);

  // Fetch Parts
  useEffect(() => {
    fetch("http://localhost:3000/api/parts")
      .then((res) => res.json())
      .then((data) => setParts(data))
      .catch((err) => console.error("Error fetching parts:", err));
  }, []);

  // Filter + Sort Generators
  const filteredGenerators = [...generators]
  .filter((gen) =>
    (gen.name ?? "").toLowerCase().includes(searchText.toLowerCase())
  )
  .sort((a, b) => {
    if (sortOption === "favorites") {
      const aFav = favoriteSet.has(`generator:${a._id}`) ? 1 : 0;
      const bFav = favoriteSet.has(`generator:${b._id}`) ? 1 : 0;
      return bFav - aFav;
    }

    if (!a.name || !b.name) return 0;
    if (sortOption === "a-z") return a.name.localeCompare(b.name);
    if (sortOption === "z-a") return b.name.localeCompare(a.name);
    return 0;
  });


  // Filter + Sort Parts
  const filteredParts = [...parts]
  .filter((part) =>
    (part.Part_Name ?? "").toLowerCase().includes(searchText.toLowerCase())
  )
  .sort((a, b) => {
    if (sortOption === "favorites") {
      const aFav = favoriteSet.has(`part:${a._id}`) ? 1 : 0;
      const bFav = favoriteSet.has(`part:${b._id}`) ? 1 : 0;
      return bFav - aFav;
    }

    if (!a.Part_Name || !b.Part_Name) return 0;
    if (sortOption === "a-z") return a.Part_Name.localeCompare(b.Part_Name);
    if (sortOption === "z-a") return b.Part_Name.localeCompare(a.Part_Name);
    return 0;
  });

  useEffect(() => {
    setGeneratorPage(1);
    setPartPage(1);
  }, [searchText, sortOption]);

  const totalGeneratorPages = Math.ceil(filteredGenerators.length / ITEMS_PER_PAGE);
  const totalPartPages = Math.ceil(filteredParts.length / ITEMS_PER_PAGE);

  const paginatedGenerators = filteredGenerators.slice(
    (generatorPage - 1) * ITEMS_PER_PAGE,
    generatorPage * ITEMS_PER_PAGE
  );

  const paginatedParts = filteredParts.slice(
    (partPage - 1) * ITEMS_PER_PAGE,
    partPage * ITEMS_PER_PAGE
  );

  return (
    <>
      {/* ===== Navbar Section ===== */}
      <Navbar />
      {/* ===== Main Content ===== */}
      <Container maxWidth="xl" sx={{ mt: 6, mb: 12 }}>
        {/* Page Title */}
        <Typography
          variant="h5"
          fontWeight={700}
          align="center"
          sx={{
            backgroundColor: "#ffffff",
            display: "inline-block",
            px: 2,
            py: 0.5,
            mb: 4,
            borderRadius: "4px",
            mx: "auto",
          }}
        >
          Current Stock
        </Typography>

        {/* Search + Sort Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 4,
          }}
        >
          <TextField
            placeholder="Search..."
            variant="outlined"
            fullWidth
            sx={{ backgroundColor: "white", borderRadius: 1 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <TextField
            select
            label="Sort By:"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            sx={{ width: "30%", backgroundColor: "white", borderRadius: 1 }}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="a-z">A-Z</MenuItem>
            <MenuItem value="z-a">Z-A </MenuItem>
            <MenuItem value="favorites">Favorites First</MenuItem>
          </TextField>
        </Box>

        {/* Generators Section */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Generators
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns="repeat(5,1fr)"
          gap={3}
        >    
          {paginatedGenerators.map((gen) => (
            <Box key={gen._id} display="flex" justifyContent="center">
              <StockCard
                id={gen._id}
                type="generator"
                title={gen.name ?? "Unnamed Generator"}
                stock={gen.Stock}
                images={[gen.Image_Url, gen.Image_Url2, gen.Image_Url3, gen.Image_Url4, gen.Image_Url5].filter((v): v is string => !!v)}
              />
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={3}>
          <Button
            variant="outlined"
            disabled={generatorPage === 1}
            onClick={() => setGeneratorPage((prev) => prev - 1)}
          >
            Previous
          </Button>

          <Typography>
            Page {generatorPage} of {Math.max(totalGeneratorPages, 1)}
          </Typography>

          <Button
            variant="outlined"
            disabled={generatorPage === totalGeneratorPages || totalGeneratorPages === 0}
            onClick={() => setGeneratorPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </Box>

        {/* Parts Section */}
        <Typography variant="h6" fontWeight={700} sx={{ mt: 6,mb: 2 }}>
          Parts
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns="repeat(5,1fr)"
          gap={3}
        >    
          {paginatedParts.map((part) => (
            <Box key={part._id} display="flex" justifyContent="center">
              <StockCard
                id={part._id}
                type="part"
                title={part.Part_Name ?? "Unnamed Part"}
                stock={part.Stock}
                images={[part.Image_Url, part.Image_Url2, part.Image_Url3, part.Image_Url4, part.Image_Url5].filter((v): v is string => !!v)}
              />
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={3}>
          <Button
            variant="outlined"
            disabled={partPage === 1}
            onClick={() => setPartPage((prev) => prev - 1)}
          >
            Previous
          </Button>

          <Typography>
            Page {partPage} of {Math.max(totalPartPages, 1)}
          </Typography>

          <Button
            variant="outlined"
            disabled={partPage === totalPartPages || totalPartPages === 0}
            onClick={() => setPartPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </Box>
      </Container>

      <Footer />
    </>
  );
}

export default CurrentStockPage;
