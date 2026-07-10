const { GoogleGenAI } = require('@google/genai');

async function listModels() {
  require('dotenv/config');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const models = await ai.models.list();
    for await (const model of models) {
      console.log(model.name);
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
