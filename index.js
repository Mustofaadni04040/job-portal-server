import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import bookmarkRoute from "./routes/bookmark.route.js";

dotenv.config({});

const app = express();

//middleware
app.use(express.json());
connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

// apis
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/bookmark", bookmarkRoute);

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
