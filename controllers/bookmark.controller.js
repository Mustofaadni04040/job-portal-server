import { Bookmark } from "../models/bookmark.model";

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
