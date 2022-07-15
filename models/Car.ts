import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
    horsepower: { type: Number },
    specifications: { type: String },
    weight: { type: Number },
    speed: { type: String },
    acceleration: { type: Number },
    hybrid: { type: Boolean, default: false },
    electric: { type: Boolean, default: false },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    description: { type: String },
    featuredImage: { type: String },
    imageGallery: { type: [String] },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.models.Car || mongoose.model('Car', carSchema);

export default Car;
