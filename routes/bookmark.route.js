import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getBookmarks } from "../controllers/bookmark.controller.js";

const router = express.Router();

router.route("/get-bookmarks").get(isAuthenticated, getBookmarks);

export default router;
