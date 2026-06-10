const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

let transporter;

const getEmailProvider = () => String(process.env.EMAIL_PROVIDER || "gmail").trim().toLowerCase();

const getFromEmail = () =>
  process.env.SENDGRID_FROM_EMAIL ||
  process.env.EMAIL_FROM ||
  process.env.GMAIL_USER ||
  process.env.SMTP_USER ||
  "no-reply@couponx.local";

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

<<<<<<< HEAD
  const provider = getEmailProvider();

  if (provider === "gmail") {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || process.env.SMTP_USER,
        pass: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS
      }
    });
    return transporter;
  }

  if (provider === "sendgrid") {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY is required when EMAIL_PROVIDER=sendgrid");
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    transporter = {
      async sendMail({ to, subject, html, text, from }) {
        return sgMail.send({
          to,
          from: from || getFromEmail(),
          subject,
          html,
          text
        });
      }
    };
    return transporter;
  }

  if (process.env.SMTP_HOST) {
=======
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (smtpUser && smtpPass) {
>>>>>>> c239aebf70e2613d1a03d53bf8540cad84757aa5
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000
    });

    return transporter;
  }

  transporter = {
<<<<<<< HEAD
    async sendMail(payload) {
      console.log("Mock email sent", payload);
      return { messageId: `mock-${Date.now()}` };
=======
    sendMail: async (payload) => {
      console.log("Mock email sent because SMTP credentials are missing", {
        to: payload.to,
        subject: payload.subject
      });

      return {
        messageId: `mock-${Date.now()}`
      };
>>>>>>> c239aebf70e2613d1a03d53bf8540cad84757aa5
    }
  };

  return transporter;
};

<<<<<<< HEAD
module.exports = {
  getTransporter,
  getEmailProvider,
  getFromEmail
=======
const verifyTransporter = async () => {
  try {
    const mailer = getTransporter();

    if (typeof mailer.verify === "function") {
      await mailer.verify();
      console.log("SMTP transporter verified successfully");
    } else {
      console.log("Mock email transporter active");
    }
  } catch (error) {
    console.error("SMTP transporter verification failed:", error.message);
  }
};

module.exports = {
  getTransporter,
  verifyTransporter
>>>>>>> c239aebf70e2613d1a03d53bf8540cad84757aa5
};
