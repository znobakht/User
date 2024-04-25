// order.mjs
import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the order schema
const orderSchema = new Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  pricePerUnit: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a model from the schema
const Order = mongoose.model("Order", orderSchema);

export default Order;
