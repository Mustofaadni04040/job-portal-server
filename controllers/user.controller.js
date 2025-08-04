import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password } = req.body;
    // const allowedRoles = ["job-seeker", "recruiter"];
    const file = req.file;
    let cloudResponse;
    const phoneNumberRegex = /^[0-9]{10,15}$/;

    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).json({
        message: "Invalid format phone number",
        success: false,
      });
    }

    if (file) {
      try {
        const fileUri = getDataUri(file);
        cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      } catch (uploadError) {
        console.log(uploadError);
        return res.status(400).json({
          message: "Failed upload file to cloudinary",
          success: false,
        });
      }
    }

    // if (!allowedRoles.includes(role)) {
    //   return res.status(400).json({
    //     message: "role is not valid",
    //     success: false,
    //   });
    // }

    if (!fullname || !email || !phoneNumber || !password) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exist with this email",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      // role,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      },
    });

    return res.status(200).json({
      message: "Account created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    //check role is correct or not
    // if (role !== user.role) {
    //   return res.status(400).json({
    //     message: "Account does not exist with this role",
    //     success: false,
    //   });
    // }

    const tokenData = {
      userId: user._id,
    };

    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        path: "/",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    let cloudResponse;
    let skillsArray;
    const phoneNumberRegex = /^[0-9]{10,15}$/;

    const userId = req.id; //middleware authentication
    let user = await User.findById(userId);

    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).json({
        message: "Invalid format phone number",
        success: false,
      });
    }

    // jika ada file resume
    if (file) {
      try {
        const fileUri = getDataUri(file);
        cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      } catch (uploadError) {
        console.log(uploadError);
        return res.status(400).json({
          message: "Failed upload file to cloudinary",
          success: false,
        });
      }
    }

    if (skills) {
      skillsArray = skills.split(",");
    }

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url; // save cloudinary url
      user.profile.resumeOriginalName = file.originalname; // save original file name
    }

    //update
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateProfilePhoto = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.id; //middleware authentication
    let user = await User.findById(userId);
    let cloudResponse;

    if (file) {
      try {
        const fileUri = getDataUri(file);
        cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          message: "Failed upload file to cloudinary",
          success: false,
        });
      }
    }

    if (cloudResponse) {
      user.profile.profilePhoto = cloudResponse.secure_url; // save cloudinary url
    }

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile photo updated successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
