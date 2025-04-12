// backend/utils/geminiClient.js
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

// Convert PDF base64 and send to Gemini model
async function sendToGemini(base64Pdf, promptText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const imagePart = {
    inlineData: {
      data: base64Pdf,
      mimeType: "application/pdf",
    },
  };

  const parts = [{ text: promptText }, imagePart];

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const response = await result.response;
    const text = response.text();
    return text;
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { sendToGemini };
