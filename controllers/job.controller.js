import { Job } from "../models/job.model.js";

export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary,
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyId,
      created_by: userId,
    });

    return res.status(201).json({
      message: "Job created successfully",
      job,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllJobs = async (req, res) => {
  try {
    let condition = {};
    const {
      keyword,
      location,
      jobType,
      experienceLevel,
      sortBy,
      limit = 6,
      page = 1,
      salaryMin,
      salaryMax,
    } = req.query;
    const locationArray = location ? location.split(",") : [];
    let sortCondition = { createdAt: -1 };

    const jobTypeArray = jobType ? jobType.split(",") : [];
    const experienceLevelArray = experienceLevel
      ? experienceLevel.split(",").map(Number)
      : [];

    // filter keyword
    if (keyword) {
      condition = { ...condition, title: { $regex: keyword, $options: "i" } };
    }

    // filter multiple regex conditions
    if (locationArray.length > 0) {
      const regexConditions = locationArray.map((location) => ({
        location: { $regex: location.trim(), $options: "i" },
      }));

      condition = {
        ...condition,
        $or: [...(condition.$or || []), ...regexConditions], // Use $or to combine multiple regex conditions for search location & array location params
      };
    }

    // filter jobType
    if (jobTypeArray.length > 0) {
      condition = { ...condition, jobType: { $in: jobTypeArray } };
    }

    // filter experience
    if (experienceLevelArray.length > 0) {
      condition = {
        ...condition,
        experienceLevel: { $in: experienceLevelArray },
      };
    }

    // sort for highest salary & latestPost
    if (sortBy === "latestPost") {
      sortCondition = { createdAt: -1 };
    } else if (sortBy === "highestSalary") {
      sortCondition = { salary: -1 };
    }

    if (salaryMin && salaryMax) {
      condition = {
        ...condition,
        salary: {
          $gte: parseInt(salaryMin),
          $lte: parseInt(salaryMax),
        },
      };
    }

    const jobs = await Job.find(condition)
      .populate({ path: "company" })
      .sort(sortCondition)
      .limit(limit)
      .skip(limit * (page - 1));

    const count = await Job.countDocuments(condition);

    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      pages: Math.ceil(count / limit),
      total: count,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId)
      .populate({
        path: "applications", // Populate applications
      })
      .populate({ path: "company" });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    return res.status(200).json({
      job,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId })
      .populate({
        path: "company",
      })
      .limit(limit)
      .skip(limit * (page - 1));

    if (!jobs) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    const count = await Job.countDocuments(jobs);

    return res.status(200).json({
      jobs,
      total: count,
      pages: Math.ceil(count / limit),
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
