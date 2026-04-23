import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;      // can be 4.5
  verified: boolean;
  createdAt?: string;
}

function StarRow({ rating }: { rating: number }) {
  // supports halves like 4.5
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ fontSize: 14, letterSpacing: 1 }}>
        <Box component="span" sx={{ color: "#f2b01e" }}>
          {"★".repeat(full)}
          {half ? "½" : ""}
        </Box>
        <Box component="span" sx={{ color: "#ddd" }}>
          {"★".repeat(empty)}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}
      </Typography>
    </Box>
  );
}

export default function ReviewMarquee() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setState("loading");
        const res = await fetch("/api/reviews/public?limit=12", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Review[];
        setReviews(Array.isArray(data) ? data : []);
        setState("ready");
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error("Failed to load reviews:", e);
        setState("error");
      }
    })();

    return () => controller.abort();
  }, []);

  const loopItems = useMemo(
    () => (reviews.length ? [...reviews, ...reviews] : []),
    [reviews]
  );

  if (state === "error") {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="error">Couldn’t load reviews right now.</Typography>
      </Box>
    );
  }

  if (state === "loading") {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">Loading reviews…</Typography>
      </Box>
    );
  }

  if (!reviews.length) return null;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h5" fontWeight={700}>
          What Customers Say
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Recent reviews from our customers.
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          bgcolor: "#f6f7f9",
          py: 2,
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            top: 0,
            width: 90,
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
          },
          "&::before": {
            left: 0,
            background:
              "linear-gradient(to right, #f6f7f9 0%, rgba(246,247,249,0) 100%)",
          },
          "&::after": {
            right: 0,
            background:
              "linear-gradient(to left, #f6f7f9 0%, rgba(246,247,249,0) 100%)",
          },
          "&:hover .marqueeTrack": { animationPlayState: "paused" },
        }}
      >
        <Box
          className="marqueeTrack"
          sx={{
            display: "flex",
            gap: 2,
            width: "max-content",
            px: 2,
            animation: "reviewsScroll 45s linear infinite",
            "@keyframes reviewsScroll": {
              from: { transform: "translateX(0)" },
              to: { transform: "translateX(-50%)" },
            },
          }}
        >
          {loopItems.map((r, idx) => (
            <Paper
              key={`${r._id}-${idx}`}
              elevation={3}
              sx={{
                flex: "0 0 auto",
                width: { xs: 260, sm: 320 },
                borderRadius: 3,
                p: 2,
                // 1. Enable Flexbox and set direction to column
                display: "flex",
                flexDirection: "column",
                // 2. Give cards a minimum height so they all look uniform
                minHeight: 180,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StarRow rating={r.rating} />
                {r.verified ? (
                  <Chip size="small" label="Verified" sx={{ ml: "auto" }} />
                ) : null}
              </Box>

              <Typography sx={{ mt: 1 }} variant="body2">
                “{r.comment}”
              </Typography>

              {/* 3. THE SPACER: flexGrow: 1 pushes everything below it to the bottom */}
              <Box sx={{ flexGrow: 1 }} />

              <Typography sx={{ mt: 1.25 }} variant="caption" color="text.secondary">
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {r.name}
                </Box>
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}