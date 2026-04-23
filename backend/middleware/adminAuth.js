import User from "../../models/user.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    // 1. Safety check
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // 2. Query the DB
    const user = await User.findById(req.user.uid);

    // 3. Authorization check
    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (error) {
    console.error("Admin Check Error:", error);
    res.status(500).json({ message: "Server error checking permissions." });
  }
};