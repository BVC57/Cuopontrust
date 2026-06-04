const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (transporter) {
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
    sendMail: async (payload) => {
      console.log("Mock email sent", payload);
      return { messageId: `mock-${Date.now()}` };
    }
  };

  return transporter;
};

module.exports = { getTransporter };
