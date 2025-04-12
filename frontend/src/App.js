import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { marked } from "marked";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState([]);
  const voicesLoaded = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      if (synthVoices.length !== 0) {
        setVoices(synthVoices);
        voicesLoaded.current = true;
      }
    };

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const speakText = (markdownText) => {
    if (!voicesLoaded.current) {
      console.warn("Voices not yet loaded");
      return;
    }

    const html = marked.parse(markdownText);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.lang = "en-US";

    const mysticalVoice =
      voices.find((v) => v.name.includes("UK English Female")) ||
      voices.find((v) => v.name.includes("en-GB")) ||
      voices.find((v) => v.name.includes("en-US")) ||
      voices[0];

    if (mysticalVoice) utterance.voice = mysticalVoice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      setSummary(res.data.summary);
      speakText(res.data.summary);
    } catch (err) {
      console.error(err);
      alert("Failed to summarize.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cave-container">
      <div className="footprints-bg" />
      <div className="campfire">
        <div className="flame"></div>
        <div className="flame"></div>
        <div className="flame"></div>
        <div className="log log1"></div>
        <div className="log log2"></div>
      </div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, type: "spring" }}
        className="glow-heading"
      >
        🔥 <span className="flicker">The Scroll of the Ancients</span>
      </motion.h1>

      <motion.input
        className="file-input"
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        whileHover={{ scale: 1.05 }}
      />

      <motion.button
        onClick={handleUpload}
        disabled={loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? "Summoning the Dino Spirits..." : "Scan the Ancient Scroll"}
      </motion.button>

      {loading && (
        <motion.div
          className="dino-waiting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3JpbWl3NHF1bWN4am5oZTJxM2l6M2E5NDFzZGx3YXg4dWJxZW9zNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LHjdVSE9zwilZ0knGA/giphy.gif"
            alt="Dino is reading..."
            className="dino-gif"
          />
          <p className="dino-caption">
            The Dino Sage is reading your scroll... 🦖
          </p>
        </motion.div>
      )}

      {summary && (
        <motion.div
          className="summary-scroll"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>📜 Scroll Summary:</h2>
          <div dangerouslySetInnerHTML={{ __html: marked.parse(summary) }} />
          <button className="rune-button" onClick={() => speakText(summary)}>
            🦖 Hear the Tale Again
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default App;
