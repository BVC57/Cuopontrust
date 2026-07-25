require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const RewardSetting = require("./src/models/RewardSetting");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cuopontrust")
  .then(async () => {
    console.log("Connected to MongoDB.");
    const setting = await RewardSetting.findOne({ singletonKey: "default" });
    if (setting) {
      setting.spinRewards = [
        { label: "5 Coins", coins: 5, probability: 30 },
        { label: "10 Coins", coins: 10, probability: 25 },
        { label: "15 Coins", coins: 15, probability: 20 },
        { label: "20 Coins", coins: 20, probability: 15 },
        { label: "25 Coins", coins: 25, probability: 10 }
      ];
      await setting.save();
      console.log("Updated spinRewards successfully!");
    } else {
      console.log("No setting found, default will be created on next boot.");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
