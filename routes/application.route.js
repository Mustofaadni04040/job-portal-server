import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isValidatedObjectId } from "../middlewares/isValidatedObjectId.js";
import {
  applyJob,
  getApplicants,
  getAppliedJobs,
  updateStatus,
} from "../controllers/application.controller.js";

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, isValidatedObjectId, applyJob);
router.route("/get-applied-jobs").get(isAuthenticated, getAppliedJobs);
router
  .route("/:id/applicants")
  .get(isAuthenticated, isValidatedObjectId, getApplicants);
router
  .route("/status/:id/update")
  .put(isAuthenticated, isValidatedObjectId, updateStatus);

export default router;
