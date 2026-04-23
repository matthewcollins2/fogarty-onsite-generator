import Admin from '../models/admin.model.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const getAdmins = async (req, res) =>{
 try {
        const admin = await Admin.find({});
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const getAdmin = async (req, res) =>{
    try {
        const {id} = req.params;
        const admin = await Admin.findById(id);
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const createAdmin = async (req, res) => {
  try {
    const { name, userID, password, email, phoneNumber } = req.body;

    // Check if email is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Validate password pattern
    const passwordRegex = /^(?=(?:.*[A-Z]){2,})(?=(?:.*[a-z]){2,})(?=(?:.*\d){2,})(?=(?:.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]){2,}).{12,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 12 characters long and include at least 2 uppercase, 2 lowercase, 2 numbers, and 2 special characters.",
      });
    }


    const admin = new Admin({
      name,
      userID,
      password,
      email,
      phoneNumber,
    });

    await admin.save();
    res.status(201).json({ message: "New Admin User Created" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const passwordRegex = /^(?=(?:.*[A-Z]){2,})(?=(?:.*[a-z]){2,})(?=(?:.*\d){2,})(?=(?:.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]){2,}).{12,}$/;


    // If password is provided in update, hash it again
    if (updateData.password) {
      const passwordRegex = /^(?=(?:.*[A-Z]){2,})(?=(?:.*[a-z]){2,})(?=(?:.*\d){2,})(?=(?:.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]){2,}).{12,}$/;
      if (!passwordRegex.test(updateData.password)) {
        return res.status(400).json({
          message:
            "Password must be at least 12 characters long and include at least 2 uppercase, 2 lowercase, 2 numbers, and 2 special characters.",
        });
      }
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true, }).select("-password");
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
     try {
        const {id} = req.params;
        const admin = await Admin.findByIdAndDelete(id, req.body);
        if(!admin){
            return res.status(404).json({message: "Admin not found"});
        }
        res.status(200).json({message:"Admin was successfully deleted"});
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const loginAdmin = async (req, res) => {
  try {
    const { userID, password } = req.body;

    // check if username is correct
    const admin = await Admin.findOne({ userID });
    if (!admin) {
      return res.status(400).json({ message: "Invalid Username or Password" });
    }

    // Compare password with hashed (unable to use as passwords in db aren't hashed)
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === admin.password;
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Username or Password" });
    }

    // JWT token
    const token = jwt.sign(
      { id: admin._id, userID: admin.userID },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "2h" }
    );

    //Set token to http only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: false, 
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 2, // age of token = 2 hours (milliseconds to seconds to minutes to hours)
      }).status(200).json({
        message: "Login successful",
        admin: {
          id: admin._id,
          userID: admin.userID,
          email: admin.email,
          phoneNumber: admin.phoneNumber,
          adminLevel: admin.adminLevel,
          permissions: admin.permissions,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const verified = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    const admin = await Admin.findById(verified.id).select("password");

    if (!admin) {
      res.clearCookie("token");
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ admin });
  } catch (error) {
    console.error("Auth check error:", error);

    // Clears cookie if verification failed
    res.clearCookie("token");
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// admin logout for navbar logout button
export const logoutAdmin = (req, res) => {
  res.clearCookie("token", {
      httpOnly: true,
      secure: false, 
      sameSite: "strict",
  });

  return res.status(200).json({ message: "Logged out" });
};

