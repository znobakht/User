import Joi from "joi";

export const createOrderSchema = Joi.object({
  address: Joi.string().required(),
  productName: Joi.string().required(),
  pricePerUnit: Joi.number().required(),
  quantity: Joi.number().required(),
});
export const editOrderSchema = Joi.object({
  address: Joi.string(),
  productName: Joi.string(),
  pricePerUnit: Joi.number(),
  quantity: Joi.number(),
});
