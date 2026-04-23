import Navbar from "./Navbar";
import Footer from "./Footer";
import { Container, Grid, Typography } from "@mui/material";
import { useState, useEffect } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

function FAQ() {
  const [faqText, setFaqText] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/pagecontent/faq`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setFaqText(d.content || ""))
      .catch((err) => {
        console.error("Failed to load FAQ content:", err);
        setFaqText("");
      })
      .finally(() => setLoading(false));
  }, []);

  const parseFaqContent = () => {
    if (!faqText) return [];

    const items: { question: string; answer: string }[] = [];
    const lines = faqText.split("\n");
    let currentQuestion = "";
    let currentAnswer = "";

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("-")) {
        // Save previous question-answer pair if exists
        if (currentQuestion) {
          items.push({ question: currentQuestion, answer: currentAnswer });
          currentAnswer = "";
        }
        // Start new question (remove the '-' prefix)
        currentQuestion = trimmedLine.substring(1).trim();
      } else if (currentQuestion && trimmedLine) {
        // Add to answer
        currentAnswer += (currentAnswer ? " " : "") + trimmedLine;
      }
    });

    // Add last question-answer pair
    if (currentQuestion) {
      items.push({ question: currentQuestion, answer: currentAnswer });
    }

    return items;
  };

  const faqItems = parseFaqContent();

  return (
    <>
      <Navbar />
      {/* Container for questions and answsers*/}
      <Container maxWidth="lg" sx={{ mt: 15, mb: 10 }}>
        {/* Styling and sizing for container*/}
        <Grid container spacing={0} alignItems="left">
          <Grid size={{ xs: 12, md: 15 }}>
            {/* Title with sizing and alignment */}
            <Typography
              variant="h3"
              fontWeight={700}
              gutterBottom
              align="center"
            >
              Frequently Asked Questions
            </Typography>

            {faqItems.length > 0 ? (
              faqItems.map((item, index) => (
                <div key={index}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {item.question}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {item.answer}
                  </Typography>
                </div>
              ))
            ) : (
              <Typography variant="h6" color="text.secondary">
                No FAQ content available.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default FAQ;
