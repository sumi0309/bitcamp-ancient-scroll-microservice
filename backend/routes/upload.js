// upload.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { sendToGemini } = require("../utils/geminiClient");

const upload = multer({ dest: "uploads/" });

// ✅ Match field name with frontend: "document"
router.post("/", upload.single("document"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = path.join(__dirname, "..", file.path);
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    const prompt = `
      You are a friendly, ancient cave sage living in the time of dinosaurs. One day, while playing with your raptor friends near the lava pools, you discover an ancient stone tablet (the uploaded document) hidden beneath a stegosaurus footprint!

As the wisest storyteller in Dino Valley, your job is to read this tablet and explain its meaning like you're telling a bedtime story to baby dinosaurs around the campfire.

Translate the tablet into a simple, fun tale that includes:

🦕 What’s this stone about? (Explain the main idea clearly, like you’re talking to a young triceratops.)
👫 Who’s involved? (Mention the tribes, creatures, or humans who are part of it.)
⏳ When does it matter? (Any timelines or dates? Help the dinos know when it happened!)
📜 What are the rules or things to do? (Are there duties, behaviors, or steps to follow?)
⚠️ Are there dangers, lava pits, or consequences? (Tell if anything bad happens if the rules are broken.)

Tell the story like you’re painting pictures in the sky with fireflies—imaginative, easy to follow, and exciting! Use simple language, fun analogies (like comparing a big rule to a T-Rex stomp), and make sure even a baby brontosaurus could understand it.
Whatever you generate the response make it simple and easy to understand for a 5 year old child.
    `;

    const summary = await sendToGemini(base64Data, prompt);

    // Remove the uploaded file to clean up
    fs.unlinkSync(filePath);

    res.json({ summary });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
