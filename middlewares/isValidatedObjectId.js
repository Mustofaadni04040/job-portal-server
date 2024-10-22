import mongoose from "mongoose";

export const isValidatedObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "ID is not valid",
      success: false,
    });
  }
  next();
};
