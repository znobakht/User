import express from "express";
import authMiddleware from "../../middleware/authMiddleware.mjs";
import xss from "xss";
import {
  createOrderSchema,
  editOrderSchema,
} from "../../validation/orderValidationSchemas.mjs";
import Order from "../../models/Order.mjs";
import mongoose from "mongoose";
const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { error, value } = createOrderSchema.validate(req.body);
  if (error) {
    // Return validation errors
    return res
      .status(400)
      .json({ error: error.details.map((detail) => detail.message) });
  }
  try {
    const { productName, address, quantity, pricePerUnit } = value;
    const newOrder = new Order({
      customerName: req.user.name,
      customerId: req.user.userId,
      address: xss(address),
      productName: xss(productName),
      quantity: xss(quantity),
      pricePerUnit: xss(pricePerUnit),
    });

    await newOrder.save();
    // console.log(newOrder);
    res.json({
      code: "1",
      message: "Order created successfully",
      newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/", authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number, default to 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Number of items per page, default to 10 if not provided

  try {
    // Query the database for orders with pagination
    const orders = await Order.find({ customerId: req.user.userId }) //user can only see its own orders
      .skip((page - 1) * limit)
      .limit(limit);

    // Count total number of orders
    const totalOrders = await Order.countDocuments();

    // Calculate total number of pages
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:id", authMiddleware, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.userId;

  try {
    // Query the database for the order by ID
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Respond with the user information
    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.put("/:id", authMiddleware, async (req, res) => {
  const orderId = req.params.id;
  const { error, value } = editOrderSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((detail) => detail.message) });
  }

  try {
    const value1 = {
      ...value,
      address: xss(value.address),
      productName: xss(value.productName),
    };
    let wantedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        customerId: req.user.userId,
      },
      { $set: value1 }, // Update
      { new: true }
    );
    if (!wantedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order updated successfully",
      order: wantedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.userId;

  try {
    // Find the user by ID and delete it
    const deletedOrder = await Order.findOneAndDelete({
      customerId: userId,
      _id: orderId,
    });

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Respond with success message
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
