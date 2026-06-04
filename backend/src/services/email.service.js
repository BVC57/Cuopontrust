const { getTransporter } = require("../config/mail");

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text
  });
};

module.exports = { sendEmail };
