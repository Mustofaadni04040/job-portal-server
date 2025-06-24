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

    console.log("existingBookmark", existingBookmark);

    if (existingBookmark) {
      res.status(400).json({
        success: false,
        message: "Job already bookmarked",
      });
      return;
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

    console.log("jobid", jobId);
    console.log("userid", userId);

    const bookmark = await Bookmark.findOne({
      user: userId,
      job: jobId,
    });

    if (!bookmark) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    console.log("bookmark", bookmark);

    await bookmark.deleteOne();

    res.status(200).json({
      success: true,
      message: "Job bookmark removed successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
