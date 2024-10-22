import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getAdminJobs,
  getAllJobs,
  getJobById,
  postJob,
} from "../controllers/job.controller.js";
import { isValidatedObjectId } from "../middlewares/isValidatedObjectId.js";

const router = express.Router();

router.route("/post-job").post(isAuthenticated, postJob);
router.route("/get-jobs").get(isAuthenticated, getAllJobs);
router.route("/get-admin-jobs").get(isAuthenticated, getAdminJobs);
router
  .route("/get-job/:id")
  .get(isAuthenticated, isValidatedObjectId, getJobById);

export default router;
