import express from "express";
import User from "../models/user.model.js";
import { getUsers, getUser, createUser, updateUser, updateUserEmail, deleteUser, updateUserRole, getFavorites, toggleFavorite} from "../controller/user.controller.js";
import { verifyFirebaseToken } from "../backend/middleware/auth.ts"; 

const router = express.Router();

router.post("/", createUser); 

router.post("/login", verifyFirebaseToken, (req, res) => {
    res.status(200).json({ message: "Authenticated", user: req.user });
})

// Get current user info - MUST be before /:id route
router.get("/me", verifyFirebaseToken, async (req, res) => {
    try {
        const firebaseUid = req.user.uid;
        
        // The User model uses Firebase UID as _id
        const user = await User.findById(firebaseUid).select("name email role userID phoneNumber address receiveTexts receiveEmails favorites");
        
        if (!user) return res.status(404).json({ error: "user not found" });
        
        res.json({
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                userID: user.userID, 
                role: user.role,   
                phoneNumber: user.phoneNumber,
                address: user.address,
                receiveTexts: user.receiveTexts,
                receiveEmails: user.receiveEmails,
                favorites: user.favorites ?? [],
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Protected routes: require a valid Firebase token
router.get("/favorites", verifyFirebaseToken, getFavorites);
router.patch("/favorites/toggle", verifyFirebaseToken, toggleFavorite);
router.get('/', verifyFirebaseToken, getUsers);
router.get("/:id", verifyFirebaseToken, getUser);
router.put("/:id", verifyFirebaseToken, updateUser);
router.put("/ver/:email", updateUserEmail);
router.delete("/:id", verifyFirebaseToken, deleteUser);

router.patch('/:id/role', verifyFirebaseToken, updateUserRole);

router.get("/me/:id", verifyFirebaseToken, async (req, res) => {
    try {
        const { id } = req.params; 
        
        // Security check: ensure the logged-in user is requesting THEIR OWN data
        if (req.user.uid !== id) {
            return res.status(403).json({ error: "Access denied: Unauthorized UID" });
        }

        const user = await User.findById(id).select("name email role userID phoneNumber address");
        
        if (!user) return res.status(404).json({ error: "user not found" });
        
        res.json({
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                userID: user.userID, 
                role: user.role,   
                phoneNumber: user.phoneNumber,
                address: user.address, 
                favorites: user.favorites ?? [],   
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.patch('/:id/role', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role input
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role type" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: role },
      { new: true } // Returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Backend Role Error:", error);
    res.status(500).json({ message: "Server error updating role" });
  }
});



export default router;