import mongoose, { Model } from "mongoose";
import { User } from "@/types";

let UserModel: Model<User>;

try {
  UserModel = mongoose.model<User>("User");
} catch {
  const userSchema = new mongoose.Schema<User>(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["admin", "student"],
        default: "student",
      },
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
    },
    {
      timestamps: true,
    }
  );

  UserModel = mongoose.model<User>("User", userSchema);
}

export default UserModel;
