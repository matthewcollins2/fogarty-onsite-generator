import Review from "../models/review.model.js";

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).lean();
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const created = await Review.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Review.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json({ message: "Review was successfully deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Public endpoint for homepage marquee
export const getPublicReviews = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "5", 10), 50);

    const filter = {verified: true};

    const reviews = await Review.find({ verified: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json(reviews);
  } catch (err) {
    console.error("getPublicReviews error:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};