import { acceptedMail, rejectedMail } from "../mail/index.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({
        message: "Job id is required",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user.profile.resume) {
      return res.status(400).json({
        message: "Please upload your CV/Resume first",
        success: false,
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "you have already applied for this job",
        success: false,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();

    return res.status(201).json({
      message: "Job applied successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// user applied jobs
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job", // mendapat detail pekerjaan dan perusahaan
        options: { sort: { createdAt: -1 } },
        populate: { path: "company", options: { sort: { createdAt: -1 } } },
      });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    return res.status(200).json({
      application,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// get all applicants for a job
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { page = 1, limit = 5 } = req.query;

    const applicants = await Application.find({ job: jobId })
      .populate({
        path: "applicant",
        select: "_id fullname email phoneNumber",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "profile",
        },
      })
      .limit(limit)
      .skip(limit * (page - 1));

    if (!applicants) {
      return res.status(404).json({
        message: "applicants not found",
        success: false,
      });
    }

    const count = await Application.countDocuments({ job: jobId });

    return res.status(200).json({
      applicants,
      total: count,
      pages: Math.ceil(count / limit),
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
    })
      .populate({
        path: "job",
        select: "title",
        populate: { path: "company", select: "name" },
      })
      .populate({ path: "applicant", select: "fullname email" });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    application.status = status.toLowerCase();
    await application.save();

    if (status === "accepted") {
      await acceptedMail(application.applicant.email, application);
    }

    if (status === "rejected") {
      await rejectedMail(application.applicant.email, application);
    }

    return res.status(200).json({
      message: "Status updated successfully",
      status,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
