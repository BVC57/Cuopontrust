const { getEmailProvider, getFromEmail, getTransporter } = require("../config/mail");

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: getFromEmail(),
    to,
    subject,
    html,
    text
  });
  return {
    provider: getEmailProvider()
  };
};

module.exports = { sendEmail };
