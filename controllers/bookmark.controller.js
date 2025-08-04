import { Bookmark } from "../models/bookmark.model.js";

export const addBookmark = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.id;

    const existingBookmark = await Bookmark.findOne({
      user: userId,
      job: jobId,
    });

    if (existingBookmark) {
      res.status(400).json({
        success: false,
        message: "Job already saved",
      });
      return;
    }

    const bookmark = await Bookmark.create({
      user: userId,
      job: jobId,
    });

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
      bookmark,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const userId = req.id;

    const bookmarks = await Bookmark.find({ user: userId }).populate({
      path: "job",
      populate: { path: "company" },
    });

    res.status(200).json({
      success: true,
      bookmarks,
    });
  } catch (error) {
    console.log(error);
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    const bookmark = await Bookmark.findOne({
      user: userId,
      job: jobId,
    });

    await bookmark.deleteOne();

    res.status(200).json({
      bookmark,
      success: true,
      message: "Job removed successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
