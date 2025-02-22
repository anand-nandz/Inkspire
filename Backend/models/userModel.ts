import { IUser } from "../types/userTypes";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema<IUser>({
    firstName : { type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    profileImage: { type: String, default: "" },
    dob: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, required: true},
    interests: {type: [String], required: true, default:[]},
    isActive: {type: Boolean, required: true,  default: false }
})

const userModel = mongoose.model<IUser>('user',userSchema);
export default userModel;