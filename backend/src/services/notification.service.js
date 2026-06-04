const Notification = require("../models/Notification");
const { sendEmail } = require("./email.service");

const createNotification = async ({ userId, type, title, message, email }) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    emailSent: Boolean(email)
  });

  if (email) {
    await sendEmail({
      to: email,
      subject: title,
      text: message,
      html: `<p>${message}</p>`
    });
  }

  return notification;
};

module.exports = { createNotification };
