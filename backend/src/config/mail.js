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
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

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
    async sendMail(payload) {
      console.log("Mock email sent", payload);
      return { messageId: `mock-${Date.now()}` };
    }
  };

  return transporter;
};

const verifyTransporter = async () => {
  const provider = getEmailProvider();
  const activeTransporter = getTransporter();

  if (provider === "sendgrid") {
    console.log(`Email provider ready: ${provider}`);
    return true;
  }

  if (typeof activeTransporter.verify === "function") {
    await activeTransporter.verify();
  }

  console.log(`Email provider ready: ${provider}`);
  return true;
};

module.exports = {
  getTransporter,
  getEmailProvider,
  getFromEmail,
  verifyTransporter
};
