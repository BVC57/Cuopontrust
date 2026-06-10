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
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
    });
    return transporter;
  }

  transporter = {
    async sendMail(payload) {
      console.log("Mock email sent", payload);
      return { messageId: `mock-${Date.now()}` };
    }
  };

  return transporter;
};

module.exports = {
  getTransporter,
  getEmailProvider,
  getFromEmail
};
