import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function list() {
  try {
    // Actually the SDK doesn't expose listModels directly easily in 0.24.
    // Let's just try fetching it via fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models?.map(m => m.name).join('\n'));
  } catch (e) {
    console.error(e);
  }
}

list();
