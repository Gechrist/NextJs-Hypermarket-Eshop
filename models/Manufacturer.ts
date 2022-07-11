import mongoose from 'mongoose';

const manufacturerSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, unique: true },
    icon: { type: String },
  },
  {
    timestamps: true,
  }
);

const Manufacturer =
  mongoose.models.Manufacturer ||
  mongoose.model('Manufacturer', manufacturerSchema);

export default Manufacturer;
