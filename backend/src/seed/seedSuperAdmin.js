require("dotenv").config();
const connectDb = require("../config/db");
const User = require("../models/User");

const seed = async () => {
  await connectDb();
  const email = process.env.SUPER_ADMIN_EMAIL || "bhadreshkolichauhan57@gmail.com";

  const admin = await User.findOneAndUpdate(
    { email },
    {
      name: "Super Admin",
      email,
      role: "super_admin",
      isEmailVerified: true,
      accountStatus: "active"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Super admin ready: ${admin.email}`);
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
