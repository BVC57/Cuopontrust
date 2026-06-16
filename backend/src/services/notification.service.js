const Notification = require("../models/Notification");
const { sendEmail } = require("./email.service");

const createNotification = async ({
  userId = null,
  audience = userId ? "user" : "admin",
  type,
  title,
  message,
  email,
  link = "",
  metadata = {}
}) => {
  const notification = await Notification.create({
    userId,
    audience,
    type,
    title,
    message,
    link,
    metadata,
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

const createAdminNotification = async ({ type, title, message, link = "", metadata = {} }) =>
  createNotification({
    audience: "admin",
    type,
    title,
    message,
    link,
    metadata
  });

module.exports = { createNotification, createAdminNotification };
