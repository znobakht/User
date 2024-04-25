import express from "express";
import authMiddleware from "../../middleware/authMiddleware.mjs";
import xss from "xss";
import { createOrderSchema } from "../../validation/orderValidationSchemas.mjs";
import Order from "../../models/Order.mjs"
const router = express.Router();

router.post("/", authMiddleware, async (req,res)=>{
    const {error, value} = createOrderSchema.validate(req.body);
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
        customerId: req.user._id,
        address: xss(address),
        productName: xss(productName),
        quantity: xss(quantity),
        pricePerUnit: xss(pricePerUnit),
      });

      const saved = await newOrder.save();
      console.log(newOrder);
      res.json({
        code: "1",
        message: "Order created successfully",
        order: saved,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }

})

export default router;