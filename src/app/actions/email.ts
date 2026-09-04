"use server";

export async function sendOrderEmail(
  buyerEmail: string,
  buyerName: string,
  sellerEmail: string,
  sellerName: string,
  productTitle: string,
  amount: number,
  platformFee: number,
  sellerAmount: number,
  orderId: string
) {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("EmailJS credentials missing, skipping email");
      return { success: false, error: "Email credentials not configured" };
    }

    // Email to Buyer
    const buyerResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: buyerEmail,
          to_name: buyerName,
          subject: "ऑर्डर पुष्टि - आलमनगर बाज़ार",
          message: `आपका ऑर्डर सफलतापूर्वक हो गया है!\n\nऑर्डर ID: ${orderId}\nउत्पाद: ${productTitle}\nभुगतान राशि: ₹${amount}\n\nधन्यवाद!`,
        },
      }),
    });

    // Email to Seller
    const sellerResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: sellerEmail,
          to_name: sellerName,
          subject: "नया ऑर्डर प्राप्त - आलमनगर बाज़ार",
          message: `आपको एक नया ऑर्डर मिला है!\n\nऑर्डर ID: ${orderId}\nउत्पाद: ${productTitle}\nकुल राशि: ₹${amount}\nप्लेटफ़ॉर्म शुल्क (15%): ₹${platformFee}\nआपको मिलेगा: ₹${sellerAmount}\n\nकृपया जल्द ऑर्डर पूरा करें!`,
        },
      }),
    });

    if (buyerResponse.ok && sellerResponse.ok) {
      return { success: true };
    } else {
      return { success: false, error: "Email sending failed" };
    }
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: "Email sending failed" };
  }
}