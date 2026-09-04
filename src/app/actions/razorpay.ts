"use server";

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createOrder(amount: number, currency: string = "INR") {
  try {
    const options = {
      amount: amount * 100, // Razorpay accepts amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return { success: false, error: "Order creation failed" };
  }
}

export async function verifyPayment(paymentId: string, orderId: string, signature: string) {
  try {
    const crypto = require("crypto");
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generated_signature === signature) {
      return { success: true };
    } else {
      return { success: false, error: "Invalid signature" };
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return { success: false, error: "Verification failed" };
  }
}