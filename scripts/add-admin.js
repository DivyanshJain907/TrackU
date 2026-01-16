const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Use environment variables directly
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://divyanshjain883_db_user:FFaTstLeyVrqtVMd@cluster0.stshrg1.mongodb.net/?appName=Cluster0";

// Define User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  phone: String,
  isClubLeader: Boolean,
  isApproved: Boolean,
  club: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

async function addAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "divyanshjaindpsschool@gmail.com",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Hesoyam@123", salt);

    // Create admin user
    const adminUser = new User({
      username: "Admin",
      email: "divyanshjaindpsschool@gmail.com",
      password: hashedPassword,
      phone: "",
      isClubLeader: true,
      isApproved: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email: divyanshjaindpsschool@gmail.com");
    console.log("Password: Hesoyam@123");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error adding admin:", error);
    mongoose.connection.close();
  }
}

addAdmin();
