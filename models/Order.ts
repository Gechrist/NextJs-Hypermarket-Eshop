import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderEmail: { type: String, required: true },
    orderItems: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paypalDetails: {
      orderID: { type: String },
      payer: {
        email_address: { type: String },
        name: {
          given_name: { type: String },
          surname: { type: String },
        },
        payer_id: { type: String },
      },
      paymentID: { type: String },
      status: { type: String },
      create_time: { type: String },
      update_time: { type: String },
    },
    creditCardDetails: {
      date: { type: String },
      amount: { type: String },
      currency: { type: String },
      paymentID: { type: String },
      status: { type: String },
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true },
    isDelivered: { type: Boolean, required: true },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
