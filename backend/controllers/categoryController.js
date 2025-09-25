// const axios = require('axios');

// const CLASSIFY_API_URL = 'https://cmfz3mbve9lbho3wto6okrwkg.agent.pa.smyth.ai/api/classify_news';

// exports.classifyNews = async (req, res) => {
//   try {
//     const { news_content, content } = req.body;
    
//     // Accept both 'news_content' and 'content' for flexibility
//     const newsContent = news_content || content;
    
//     if (!newsContent || newsContent.trim() === '') {
//       return res.status(400).json({ 
//         message: "News content is required for classification" 
//       });
//     }

//     // Call external classification API
//     const response = await axios.post(CLASSIFY_API_URL, {
//       news_content: newsContent
//     }, {
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       timeout: 30000 // 30 second timeout
//     });

//     res.json({
//       message: "News classified successfully",
//       content: newsContent,
//       category: response.data, // API returns plain string
//       success: true
//     });

//   } catch (error) {
//     console.error("News classification error:", error.message);
    
//     if (error.code === 'ECONNABORTED') {
//       return res.status(408).json({ 
//         message: "Request timeout - classification service is taking too long" 
//       });
//     }
    
//     if (error.response) {
//       return res.status(error.response.status || 500).json({
//         message: "Classification service error",
//         error: error.response.data || error.message
//       });
//     }
    
//     res.status(500).json({ 
//       message: "Failed to classify news",
//       error: "Internal server error"
//     });
//   }
// };

const { GoogleGenerativeAI } = require("@google/generative-ai");
const GEMINI_API_KEY  = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

exports.classifyNews = async (req, res) => {
  const { news_content } = req.body;

  if (!news_content) {
    return res.status(400).json({ error: "News content is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a news categorization specialist. You can analyze news content in both English and Bangla languages and classify them into appropriate categories. Always return the category classification in English keywords only, regardless of the input language. You understand context and content across languages and provide accurate categorization for various news topics.Only return most relevant single category keyword in English without any explanation or additional text. The possible categories are: Politics, Sports, Entertainment, Technology, Health, Business, World, Lifestyle, Education, Science, Environment, Travel, Food, Culture, Opinion, Religion, History, Literature.

Question: ${news_content}
Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    if (!answer) {
      return res
        .status(500)
        .json({ error: "No valid response received from AI." });
    }

    res.json({ answer });
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    res.status(500).json({ error: "Failed to process the news_content." });
  }
};