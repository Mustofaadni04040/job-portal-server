import { Bookmark } from "../models/bookmark.model.js";

export const addBookmark = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.id;

    if (!jobId) {
      res.status(400).json({
        success: false,
        message: "Job not found",
      });
    }

    const existingBookmark = await Bookmark.findOne({
      user: userId,
      job: jobId,
    });

    if (existingBookmark) {
      res.status(400).json({
        success: false,
        message: "Job already bookmarked",
      });
    }

    const bookmark = await Bookmark.create({
      user: userId,
      job: jobId,
    });

    res.status(201).json({
      success: true,
      message: "Job bookmarked successfully",
      bookmark,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const userId = req.id;

    const bookmarks = await Bookmark.find({ user: userId }).populate("job");
    console.log("bookmarks", bookmarks);

    res.status(200).json({
      success: true,
      bookmarks,
    });
  } catch (error) {
    console.log(error);
  }
};
