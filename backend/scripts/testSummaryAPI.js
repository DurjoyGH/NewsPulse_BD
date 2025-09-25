#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

const SUMMARIZE_API_URL = 'https://cmfyvn5v38dg62py5l86k12a1.agent.a.smyth.ai/api/summarize_bengali';

async function testSummarizeAPI() {
  try {
    console.log('🧪 Testing summarization API...');
    
    const testText = 'এটি একটি পরীক্ষামূলক বাংলা টেক্সট। আমরা দেখতে চাই যে API কী রিটার্ন করে।';
    
    console.log('📤 Sending text:', testText);
    
    const response = await axios.post(
      SUMMARIZE_API_URL,
      {
        bengali_text: testText,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log('📥 Response status:', response.status);
    console.log('📥 Response data type:', typeof response.data);
    console.log('📥 Response data:', response.data);
    
    if (typeof response.data === 'object') {
      console.log('📥 Response data (stringified):', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
  }
}

testSummarizeAPI();
