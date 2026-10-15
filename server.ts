import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent as instructed by gemini-api skill
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API client initialized successfully.');
  } catch (err) {
    console.warn('Failed to initialize Gemini client:', err);
  }
} else {
  console.log('No GEMINI_API_KEY detected in env, will use intelligent fallback responses.');
}

// Fallback intelligent multi-lingual assistant for Pan-India healthcare
const generateFallbackHealthcareAnswer = (query: string, language: string): string => {
  const q = query.toLowerCase();

  if (language === 'te' || /ఆసుపత్రి|డాక్టర్|ఆరోగ్యం|ఫీజు|పథకం|రక్తం|ఎమర్జెన్సీ/.test(query)) {
    if (q.includes('ప్రభుత్వ') || q.includes('గాంధీ') || q.includes('నిమ్స్') || q.includes('aiims') || q.includes('ఉస్మానియా')) {
      return `నమస్కారం! భారతదేశంలో మరియు తెలుగు రాష్ట్రాల్లో ప్రముఖ ప్రభుత్వ ఆసుపత్రులు అందుబాటులో ఉన్నాయి:
1. **AIIMS New Delhi & AIIMS Mangalagiri/Bibinagar**: అత్యున్నత స్థాయి ఉచిత/సబ్సిడీ చికిత్సలు, రోబోటిక్ సర్జరీలు.
2. **NIMS హైదరాబాద్ (Punjagutta)**: న్యూరాలజీ, నెఫ్రాలజీ, కార్డియాలజీ విభాగాలలో నిపుణులు, ఆరోగ్యశ్రీ వర్తిస్తుంది.
3. **KGH విశాఖపట్నం**: ఉత్తరాంధ్ర ప్రజలకు 24/7 అత్యవసర మరియు సూపర్ స్పెషాలిటీ సేవలు.
4. **ఆయుష్మాన్ భారత్ (PM-JAY)** కింద ₹5,00,000 వరకు ఉచిత క్యాష్‌లెస్ చికిత్స లభిస్తుంది.
మీకు నిర్దిష్ట ఆసుపత్రిలో అపాయింట్‌మెంట్ బుక్ చేసుకోవాలా? 'Find Hospitals' విభాగంలో ఆన్‌లైన్ లేదా ఆఫ్‌లైన్ పేమెంట్ ఎంపికతో బుక్ చేసుకోవచ్చు.`;
    }
    if (q.includes('ఆరోగ్యశ్రీ') || q.includes('పథకం') || q.includes('బీమా')) {
      return `డా. వైఎస్సార్ ఆరోగ్యశ్రీ & ఆయుష్మాన్ భారత్ పథకం సమాచారం:
- **కవరేజ్**: సంవత్సరానికి కుటుంబానికి ₹5 లక్షల నుండి ₹25 లక్షల వరకు నగదు రహిత చికిత్స.
- **అర్హత**: తెల్ల రేషన్ కార్డు / రైస్ కార్డు కలిగిన కుటుంబాలు.
- **అందుబాటులో ఉన్న ఆసుపత్రులు**: నెట్‌వర్క్ విభాగం #11 లో పూర్తి జాబితాను పరిశీలించవచ్చు.
- **హెల్ప్‌లైన్**: 104 లేదా 14555.`;
    }
    if (q.includes('ఎమర్జెన్సీ') || q.includes('అత్యవసరం') || q.includes('యాక్సిడెంట్')) {
      return `అత్యవసర సమయంలో వెంటనే జాతీయ అత్యవసర నంబర్ **112** లేదా అంబులెన్స్ నంబర్ **108** కు కాల్ చేయండి. మా యాప్‌లోని ఎరుపు రంగు "SOS Emergency" బటన్ ద్వారా మీ లైవ్ లొకేషన్‌ను సమీపంలోని ట్రామా సెంటర్లకు పంపవచ్చు.`;
    }
    return `నమస్కారం! నేను MEDISEVA 360 AI సహాయకుడిని. భారతదేశంలోని అన్ని ప్రభుత్వ, ప్రైవేట్ ఆసుపత్రులు, వైద్యుల వివరాలు, ఆరోగ్యశ్రీ/ఆయుష్మాన్ భారత్ సమాచారం, రక్తనిధి వివరాల కోసం నన్ను అడగవచ్చు. మీకు ఏ సమాచారం కావాలి?`;
  }

  if (language === 'hi') {
    return `नमस्ते! मैं मेडीसेवा 360 एआई सहायक हूँ। भारत भर के शीर्ष अस्पताल (एम्स, अपोलो, फोर्टिस, निम्स) और आयुष्मान भारत (PM-JAY) योजना के तहत ₹5 लाख तक का कैशलेस इलाज उपलब्ध है। किसी भी आपातकाल में तुरंत 112 पर कॉल करें या हमारे SOS फीचर का उपयोग करें। मैं आपकी क्या मदद कर सकता हूँ?`;
  }

  if (language === 'ta') {
    return `வணக்கம்! நான் MEDISEVA 360 AI உதவியாளர். இந்தியா முழுவதும் உள்ள அரசு மற்றும் தனியார் மருத்துவமனைகள், மருத்துவர்கள் மற்றும் முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் (CMCHIS) பற்றிய விவரங்களை அறிய என்னை அணுகலாம். அவசர உதவிக்கு 112 ஐ அழைக்கவும்.`;
  }

  // English response
  if (q.includes('hospital') || q.includes('delhi') || q.includes('hyderabad') || q.includes('bangalore') || q.includes('chennai') || q.includes('mumbai')) {
    return `MEDISEVA 360 connects you with top verified hospitals across India:
- **Central Government Institutes**: AIIMS New Delhi, PGIMER Chandigarh, NIMHANS Bengaluru, Tata Memorial Mumbai.
- **State Super-Specialities**: NIMS Hyderabad, King George Hospital Visakhapatnam, KEM Mumbai.
- **Accredited Private Networks**: Apollo Hospitals (Jubilee Hills, Greams Rd), Manipal Hospital Bangalore, KIMS Secunderabad, Aster Medcity Kochi.
All empanelled hospitals accept Ayushman Bharat PM-JAY and state health schemes. You can book in-person or telemedicine slots with Pay Online (Razorpay) or Pay Offline at the hospital counter.`;
  }

  if (q.includes('scheme') || q.includes('ayushman') || q.includes('aarogyasri') || q.includes('insurance')) {
    return `Government Healthcare Benefits in India:
1. **Ayushman Bharat (PM-JAY)**: Up to ₹5,00,000 per family/year cashless cover across 27,000+ empanelled hospitals nationwide. Helpline: 14555.
2. **YSR Aarogyasri (AP & Telangana)**: Up to ₹25 Lakh cashless coverage for BPL/Rice card holders. Helpline: 104.
3. **MJPJAY (Maharashtra)**: Comprehensive treatment across 996 medical/surgical procedures.
4. **CMCHIS (Tamil Nadu)**: ₹5 Lakh cashless cover.
Visit Network #11 in our platform to check eligibility and required documents.`;
  }

  if (q.includes('emergency') || q.includes('ambulance') || q.includes('sos')) {
    return `EMERGENCY ALERT: Call 112 immediately for Pan-India Police/Ambulance/Fire response or 108 for emergency medical transport. Use the red 'SOS Emergency' button in the top navigation to broadcast your GPS coordinates to the nearest trauma care facility.`;
  }

  return `Hello! I am MEDISEVA 360 AI Assistant. I can help you find verified hospitals across India, check doctor availability, explain government health schemes (Ayushman Bharat, Aarogyasri), locate 24/7 blood banks, or guide your appointment booking. How may I assist your healthcare needs today?`;
};

// API Route for Gemini AI Chat
app.post('/api/gemini/chat', async (req, res) => {
  const { message, language = 'en' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      const systemInstruction = `You are MEDISEVA 360 AI, an official healthcare assistant for a Pan-India medical platform.
You are fluent in English, Telugu (తెలుగు), Hindi (हिंदी), and Tamil (தமிழ்).
Provide helpful, compassionate, accurate guidance about hospitals across India (AIIMS New Delhi, Apollo, NIMS, KIMS, Manipal, Fortis, Tata Memorial, KGH Visakhapatnam, etc.), medical specialists, appointment workflows (including Pay Online vs Pay Offline at hospital), and government healthcare schemes like Ayushman Bharat PM-JAY (₹5 Lakh cover) and YSR Aarogyasri.
Always include an emergency reminder (Call 112) for life-threatening situations and a disclaimer that you are an informational guide and not a medical doctor.
Reply in the language requested: ${language}.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const reply = response.text || generateFallbackHealthcareAnswer(message, language);
      return res.json({ reply, model: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('Gemini generateContent error, falling back to local medical logic:', err?.message || err);
      const fallback = generateFallbackHealthcareAnswer(message, language);
      return res.json({ reply: fallback, fallback: true });
    }
  }

  // Fallback response if no API key configured
  const reply = generateFallbackHealthcareAnswer(message, language);
  return res.json({ reply, fallback: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MEDISEVA 360 24/7 API',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MEDISEVA 360 Server running on port ${PORT}`);
  });
}

startServer();
