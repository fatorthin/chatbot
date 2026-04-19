import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";

const app = express();
const upload = multer();
const port = 3000;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = "gemini-3-flash-preview";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    res.json({ result: response.text });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  const { prompt } = req.body;
  const base64Image = req.file ? req.file.buffer.toString("base64") : null;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          text: prompt,
          type: "text",
        },
        {
          inlineData: { data: base64Image, mimeType: "image/png" },
          type: "image",
        },
      ],
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation))
      throw new Error("Conversation must be an array of messages");

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        temperature: 0.7,
        systemInstruction:
          "Jawab hanya menggunakan bahasa Indonesia. Jangan menjawab dengan bahasa lain.",
      },
    });
    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error("Error generating chat response:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
