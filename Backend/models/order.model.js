import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  name: String,
  price: Number,
  quantity: Number,
});

const shopOrderSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subtotal: Number,
  shopOrderItems: [shopOrderItemSchema],

  status: {
    type: String,
    enum: ["pending", "preparing", "out of delivery", "delivered"],
    default: "pending",
  },

  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryAssignment",
    default: null,
  },

  assignedDeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  deliveryOtp: String,
  otpExpires: Date,
  deliveredAt: Date,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentMethod: { type: String, enum: ["cod", "online"] },
    deliveryAddress: {
      text: String,
      latitude: Number,
      longitude: Number,
    },
    totalAmount: Number,
    shopOrders: [shopOrderSchema],
    payment: Boolean,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);