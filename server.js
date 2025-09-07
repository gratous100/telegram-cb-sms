const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for demo purposes
const approvals = {}; // { code: "accepted" / "rejected" }

app.use(cors());
app.use(bodyParser.json());

// Endpoint for Telegram bot to update approval status
app.post("/update-status", (req, res) => {
  const { code, status } = req.body;

  if (!code || !status) {
    return res.status(400).json({ error: "Missing code or status" });
  }

  approvals[code] = status;
  console.log(`✅ Code ${code} marked as ${status}`);
  res.json({ success: true });
});

// Optional endpoint to check current status (for testing)
app.get("/status/:code", (req, res) => {
  const code = req.params.code;
  const status = approvals[code] || "pending";
  res.json({ code, status });
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ SMS Approval Backend is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
