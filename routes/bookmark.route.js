import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  addBookmark,
  getBookmarks,
} from "../controllers/bookmark.controller.js";

const router = express.Router();

router.route("/get-bookmarks").get(isAuthenticated, getBookmarks);
router.route("/add-bookmark").post(isAuthenticated, addBookmark);

export default router;
