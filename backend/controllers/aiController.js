const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * @desc    Generate complaint description using Vision AI from uploaded image, ward, category
 * @route   POST /api/ai/generate-description
 * @access  Public
 */
const generateDescription = async (req, res, next) => {
  try {
    const { imageBase64, category, ward, language = 'hi' } = req.body;
    const isHi = language === 'hi';

    // 1. Check GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: isHi
          ? 'AI सेवा कॉन्फ़िगर नहीं है (GEMINI_API_KEY अनुपलब्ध है)। कृपया .env में GEMINI_API_KEY सेट करें।'
          : 'AI service is not configured (GEMINI_API_KEY is missing). Please set GEMINI_API_KEY in .env.'
      });
    }

    // 2. Extract Base64 and MIME type (from req.body.imageBase64 or req.file)
    let rawBase64 = '';
    let mimeType = 'image/jpeg';

    if (req.file && req.file.buffer) {
      rawBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (imageBase64) {
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        rawBase64 = parts[1];
      } else {
        rawBase64 = imageBase64;
      }
    }

    if (!rawBase64) {
      return res.status(400).json({
        success: false,
        message: isHi
          ? 'कृपया पहले समस्या की फोटो संलग्न करें।'
          : 'Please attach a photo first.'
      });
    }

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 4. Construct Prompt
    const langInstruction = isHi ? 'Hindi (Devanagari)' : 'English';
    const wardText = ward ? `Ward ${ward}` : 'the village';
    const categoryText = category || 'General Civic Grievance';

    const prompt = `You are an assistant for Gram Panchayat Sahari. Look at this photo of a civic issue in ${wardText} under category '${categoryText}'. Write a clear, respectful, formal 2-3 sentence complaint description in ${langInstruction} stating what is visible in the photo and requesting quick resolution. Return ONLY the description text, no extra formatting or quotes.`;

    const imagePart = {
      inlineData: {
        data: rawBase64,
        mimeType: mimeType
      }
    };

    // 5. Generate Content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text()?.trim() || '';

    // Strip leading/trailing quotes or markdown code blocks if present
    text = text.replace(/^```[a-z]*\n?|```$/gi, '').trim();
    text = text.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim();

    return res.status(200).json({
      success: true,
      description: text,
      message: isHi
        ? 'AI द्वारा विवरण सफलतापूर्वक तैयार किया गया!'
        : 'Description generated successfully with AI!'
    });
  } catch (error) {
    console.error('[Gemini Vision AI Error]:', error);
    const isHi = req.body?.language === 'hi';
    return res.status(500).json({
      success: false,
      message: isHi
        ? 'AI विवरण तैयार करने में समस्या आई: ' + (error.message || 'अज्ञात त्रुटि')
        : 'Failed to generate AI description: ' + (error.message || 'Unknown error')
    });
  }
};

module.exports = {
  generateDescription
};
