import express from "express";
import { sendTestEmail } from "../services/emailService.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test email endpoint (admin only)
router.post("/test", protect, admin, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required"
      });
    }

    const result = await sendTestEmail(email);
    
    res.status(200).json({
      success: true,
      message: "Test email sent successfully"
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message
    });
  }
});

export default router;