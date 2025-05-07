import nodemailer from "nodemailer";
import { gmail, password } from "../utils/email.js";
import mustache from "mustache";
import fs from "fs";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: gmail,
    pass: password,
  },
});

const acceptedMail = async (email, data) => {
  try {
    let template = fs.readFileSync("./views/accepted.html", "utf8");

    let message = {
      from: `"Seeker." ${gmail}`,
      to: email,
      subject: "Status Lamaran Anda - Diterima",
      html: mustache.render(template, data),
    };

    return await transporter.sendMail(message);
  } catch (ex) {
    console.log(ex);
  }
};

const rejectedMail = async (email, data) => {
  try {
    let template = fs.readFileSync("./views/rejected.html", "utf8");

    let message = {
      from: `"Seeker." ${gmail}`,
      to: email,
      subject: "Status Lamaran Anda - Mohon Maaf, Belum Lolos Seleksi",
      html: mustache.render(template, data),
    };

    return await transporter.sendMail(message);
  } catch (ex) {
    console.log(ex);
  }
};

export { acceptedMail, rejectedMail };
