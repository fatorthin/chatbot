import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";

const app = express();
const upload = multer();
const port = 3000;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = "gemini-3-flash-preview";

app.use(express.json());
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

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

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-3-flash-preview",
//     contents: "calculate 5 + 3",
//   });
//   console.log(response.text);
// }

// main();
