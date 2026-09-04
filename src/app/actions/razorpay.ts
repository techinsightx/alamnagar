"use server";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

function getAuthHeader(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials missing");
  }
  
  // Basic Auth: base64(key_id:key_secret)
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${credentials}`;
}

export async function createRazorpayOrder(amount: number, currency: string = "INR") {
  try {
    const authHeader = getAuthHeader();
    
    const response = await fetch(`${RAZORPAY_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1, // Auto capture
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Razorpay API error:", errorData);
      throw new Error(errorData.error?.description || "Order creation failed");
    }

    const order = await response.json();
    return { 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      }
    };
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return { success: false, error: error.message || "Order creation failed" };
  }
}

export async function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      throw new Error("Razorpay secret missing");
    }

    // Use Node.js built-in crypto (no package needed)
    const crypto = await import("crypto");
    
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature === razorpaySignature) {
      return { success: true };
    } else {
      return { success: false, error: "Invalid payment signature" };
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return { success: false, error: error.message || "Verification failed" };
  }
}