import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getCompany,
  getCompanyById,
  registerCompany,
  updateCompany,
} from "../controllers/company.controller.js";
import { isValidatedObjectId } from "../middlewares/isValidatedObjectId.js";

const router = express.Router();

router.route("/register").post(isAuthenticated, registerCompany);
router.route("/get-company").get(isAuthenticated, getCompany);
router
  .route("/get-company/:id")
  .get(isAuthenticated, isValidatedObjectId, getCompanyById);
router
  .route("/update/:id")
  .put(isAuthenticated, isValidatedObjectId, updateCompany);

export default router;
