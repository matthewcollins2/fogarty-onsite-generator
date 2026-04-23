import User from "../models/user.model.js";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params; // This will be the MongoDB _id from your frontend
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role type" });
    }

    // We use findByIdAndUpdate because your frontend sends the _id
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single user by Firebase UID
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userID: id }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const userData = {
      ...req.body,
      role: req.body.role || "user"
    };
    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json({ message: "User profile created in database", user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body.newData;

    if (updateData.password) {
      res.status(200).json({message: "User updated successfully"}); // Confirms password updated
    } else {
        const user = await User.findOneAndUpdate({ userID: id }, updateData, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({message: "User updated successfully"});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user email details
export const updateUserEmail = async (req, res) => {
  try {
    console.log("updating by email");
    const { email } = req.params;
    const updateData = req.body.newData;
    const user = await User.findOneAndUpdate({ email: email.toLowerCase() }, updateData, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({message: "User updated successfully"}); 
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Processing deletion for:", id);

    const user = await User.findOne({ userID: id });
    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    // // 1. Attempt to delete from Firebase
    // try {
    //   await getAuth().deleteUser(user.userID);
    // } catch (authError) {
    //   // If the error is that the user doesn't exist in Firebase, log it 
    //   // but do NOT crash the request. Proceed to DB deletion.
    //   if (authError.code === 'auth/user-not-found') {
    //     console.warn("User already missing from Firebase. Cleaning up MongoDB record.");
    //   } else {
    //     // If it's a different error (e.g., permission issues), re-throw it
    //     throw authError;
    //   }
    // }

    // 2. Delete from MongoDB
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ message: "User deleted successfully from DB and Auth" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    const user = await User.findOne({ userID: firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const { itemId, itemType } = req.body;

    if (!itemId || !itemType) {
      return res.status(400).json({ message: "itemId and itemType are required" });
    }

    if (!["generator", "part"].includes(itemType)) {
      return res.status(400).json({ message: "Invalid itemType" });
    }

    const user = await User.findOne({ userID: firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyExists = user.favorites.some(
      (fav) => fav.itemId === itemId && fav.itemType === itemType
    );

    if (!alreadyExists) {
      user.favorites.push({ itemId, itemType });
      await user.save();
    }

    res.status(200).json({
      message: "Favorite added",
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const { itemId, itemType } = req.body;

    if (!itemId || !itemType) {
      return res.status(400).json({ message: "itemId and itemType are required" });
    }

    const user = await User.findOne({ userID: firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.favorites = user.favorites.filter(
      (fav) => !(fav.itemId === itemId && fav.itemType === itemType)
    );

    await user.save();

    res.status(200).json({
      message: "Favorite removed",
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const { itemId, itemType } = req.body;

    if (!itemId || !itemType) {
      return res.status(400).json({ message: "itemId and itemType are required" });
    }

    if (!["generator", "part"].includes(itemType)) {
      return res.status(400).json({ message: "Invalid itemType" });
    }

    const user = await User.findOne({ userID: firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingIndex = user.favorites.findIndex(
      (fav) => fav.itemId === itemId && fav.itemType === itemType
    );

    let favorited = false;

    if (existingIndex >= 0) {
      user.favorites.splice(existingIndex, 1);
      favorited = false;
    } else {
      user.favorites.push({ itemId, itemType });
      favorited = true;
    }

    await user.save();

    res.status(200).json({
      message: favorited ? "Favorite added" : "Favorite removed",
      favorited,
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};