import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String},
  role: { type: String, default: "user" },
  googleId: { type: String },
  provider: { type: String, default: "local" },
  avatar: { type: String, default: null },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
