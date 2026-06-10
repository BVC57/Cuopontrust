const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (smtpUser && smtpPass) {
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
    sendMail: async (payload) => {
      console.log("Mock email sent because SMTP credentials are missing", {
        to: payload.to,
        subject: payload.subject
      });

      return {
        messageId: `mock-${Date.now()}`
      };
    }
  };

  return transporter;
};

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
};
