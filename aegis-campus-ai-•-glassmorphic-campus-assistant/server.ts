import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

const CAMPUS_SYSTEM_INSTRUCTION = `
You are Aegis, an intelligent, ultra-friendly, and proactive AI Campus Assistant for modern university students and faculty.
You assist with:
- Finding classrooms, computer labs, seminar halls, and faculties across campus blocks (Block A Sciences, Block B Computing, Block C Advanced AI & Robotics, Block D Admin & Auditorium).
  - BCA Computer Lab: Located in Block B (Alan Turing Computing Center), 2nd Floor, Room 204. Equipped with 60 high-spec Linux/RTX workstations.
  - Turing AI Lab: Block C, 3rd Floor, Room 310.
  - Newton Physics & Electronics Lab: Block A, Ground Floor, Room 102.
  - Central Library & Reading Hall: Block D, 1st & 2nd Floor (Open 8:00 AM - 10:00 PM).
- Faculty availability and office cabin hours:
  - Prof. Sharma (Head of AI & Systems): Cabin B-214. Office hours 2:00 PM - 4:00 PM Mon-Thu. Live status: In Cabin. Email: r.sharma@university.edu.
  - Dr. Priya Patel (Data Structures & Algorithmic Design): Cabin B-218. Office hours 11:30 AM - 1:00 PM. Live status: In Lecture Hall 402. Email: p.patel@university.edu.
  - Prof. David Chen (Cloud Computing & DevOps): Cabin C-104. Office hours 3:00 PM - 5:00 PM Tue/Fri. Live status: In Cabin.
  - Dr. A. Raman (Mathematics & Cryptography): Cabin A-302. Office hours 10:00 AM - 12:00 PM. Live status: Research Lab.
- Academic schedule & CIA Exams:
  - CIA-2 Midterm examinations start next Monday at 09:30 AM.
  - Attendance threshold is 75% for exam eligibility.
- Campus Amenities & Procedures:
  - Wi-Fi SSID: "Campus-Secure-5G" (EAP-PEAP MSCHAPv2 authentication with Student Roll No and SIMS portal password).
  - Duty Leave: Must be applied through SIMS portal within 48 hours of event participation with faculty advisor endorsement.
  - Cafeteria: Today's healthy special is Mediterranean Bowl and Steamed Dim Sums at Central Food Court.
- Always be concise, helpful, and include direct suggestions or action recommendations (e.g. map directions, scheduling office hours, or portal shortcuts).
Format responses with clean Markdown, bullet points, and highlight room numbers and timings clearly.
`;

// API Routes
//
// When BACKEND_URL is set (e.g. http://localhost:5000), all /api/* requests
// are proxied to the real Campus Management backend (auth, chat, faculty,
// schedule, locations). Otherwise the built-in mock engine below is used so
// the UI still demos without a backend/database.
const BACKEND_URL = (process.env.BACKEND_URL || '').replace(/\/$/, '');

if (BACKEND_URL) {
  app.use('/api', async (req, res) => {
    try {
      const target = `${BACKEND_URL}${req.originalUrl}`;
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string' && key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
          headers[key] = value;
        }
      }
      const init: RequestInit = { method: req.method, headers };
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
        headers['content-type'] = headers['content-type'] || 'application/json';
        init.body = JSON.stringify(req.body);
      }
      const upstream = await fetch(target, init);
      const text = await upstream.text();
      const contentType = upstream.headers.get('content-type');
      if (contentType) res.set('content-type', contentType);
      res.status(upstream.status).send(text);
    } catch (err) {
      console.error('Backend proxy error:', err);
      res.status(502).json({ success: false, message: 'Backend unavailable. Is it running at ' + BACKEND_URL + '?' });
    }
  });
} else {
app.post('/api/chat', async (req, res) => {
  try {
    const { message, role = 'student', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ],
          config: {
            systemInstruction: `${CAMPUS_SYSTEM_INSTRUCTION}\nCurrent active user mode: ${role.toUpperCase()}. Tailor your response for this persona.`,
            temperature: 0.7,
          },
        });

        const reply = response.text || "I've processed your campus query. Let me know if you need more details!";
        return res.json({ reply, source: 'gemini' });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to smart campus engine:', geminiError?.message || geminiError);
      }
    }

    // High-quality smart campus domain response engine fallback
    const lower = message.toLowerCase();
    let reply = '';
    let actionChip: string | null = null;

    if (lower.includes('bca') || (lower.includes('computer') && lower.includes('lab'))) {
      reply = `📍 **BCA Computer Lab (Lab 204)** is located on the **2nd Floor of Block B (Computing & Technology Wing)**.\n\n• **Path:** Enter Block B main atrium, take the central glass elevator or east staircase to Floor 2, turn right past the robotics showcase. Room 204 is on your left.\n• **Status:** Open for Advanced Algorithms & Web Systems lab sessions.\n• **Facilities:** 60 Ubuntu Linux nodes, Gigabit fiber, high-precision laser printing station.`;
      actionChip = 'open_map_bca';
    } else if (lower.includes('sharma') || lower.includes('prof') && lower.includes('email')) {
      reply = `👨‍🏫 **Prof. R. Sharma (Head of Department - AI & Systems)**\n\n• **Office Cabin:** Block B, Room 214 (East Wing)\n• **Email:** \`r.sharma@university.edu\`\n• **Cabin Status:** 🟢 **Currently In Cabin** (Available for walk-in consultations until 04:00 PM)\n• **Next Lecture:** Distributed Cloud Architectures at 04:30 PM in Hall 402.`;
      actionChip = 'book_sharma';
    } else if (lower.includes('cia') || lower.includes('exam') || lower.includes('midterm')) {
      reply = `📅 **Continuous Internal Assessment (CIA-2) Exam Schedule:**\n\n• **Commences:** Next Monday, Oct 12, 2026\n• **Timing:** Morning Session (09:30 AM – 11:30 AM)\n• **Key Dates:**\n  - *Mon, Oct 12:* Data Structures & Algorithms (Hall 301)\n  - *Wed, Oct 14:* Operating Systems & Distributed Systems (Hall 302)\n  - *Fri, Oct 16:* Computer Networks & Security (Hall 301)\n• **Admit Card:** Released on SIMS ERP portal. Make sure your attendance is ≥ 75%.`;
      actionChip = 'open_notices';
    } else if (lower.includes('attendance') || lower.includes('bunk') || lower.includes('percentage')) {
      reply = `📊 **Current Academic Attendance Overview (Fall Semester 2026):**\n\n• **Overall Aggregate:** **86.4%** (Well above mandatory 75% cutoff)\n• **Course Breakdown:**\n  - Data Structures: 92% (Safe: Can miss 3 classes)\n  - Operating Systems: 88% (Safe: Can miss 2 classes)\n  - Computer Networks: 78% (⚠️ Approaching limit! Maintain next 4 classes)\n  - Web Technologies Lab: 95% (Safe)\n\n*Tip: Apply for Duty Leave via SIMS within 48h if you represented the college in events.*`;
      actionChip = 'open_schedule';
    } else if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet')) {
      reply = `📶 **Campus High-Speed Wi-Fi Setup Guide:**\n\n• **SSID:** \`Campus-Secure-5G\`\n• **Security:** WPA2/WPA3 Enterprise (802.1x)\n• **EAP Method:** PEAP\n• **Phase 2 Auth:** MSCHAPv2\n• **Identity / Username:** Your Student/Faculty ID (e.g., \`2024CS1089\`)\n• **Password:** Your SIMS Portal Password\n• **CA Certificate:** Select 'Use system certificates' or 'Do not validate'.`;
    } else if (lower.includes('duty leave') || lower.includes('leave') || lower.includes('medical')) {
      reply = `📋 **Duty Leave & Medical Leave Application Process:**\n\n1. Login to the **SIMS Student Portal** > Academic Affairs > Leave Requests.\n2. Upload proof (Event participation certificate, Hackathon badge, or Doctor's certificate with reg number).\n3. Submit for Faculty Advisor approval within **48 hours** of absence.\n4. Once endorsed by HOD, attendance roster updates automatically in 24 hours.`;
    } else if (lower.includes('library') || lower.includes('book') || lower.includes('opac')) {
      reply = `📚 **Central University Library & OPAC:**\n\n• **Location:** Block D, Floors 1 & 2\n• **Operating Hours:** 08:00 AM – 10:00 PM (Reading Room open 24/7 during exam weeks)\n• **Book Lending:** 4 books for 14 days per student; renew online via OPAC before due date.\n• **Digital Repositories:** Access IEEE Xplore, ACM Digital Library, and SpringerLink from campus network without proxy.`;
    } else if (lower.includes('shuttle') || lower.includes('bus') || lower.includes('transport')) {
      reply = `🚌 **Campus Green Electric Shuttle Tracker:**\n\n• **Route A (Metro Station ⇄ Main Gate ⇄ Central Quad):** Next shuttle arriving at Main Quad in **4 mins**.\n• **Route B (Hostels ⇄ Sports Complex ⇄ Tech Wing):** Operating every 8 minutes.\n• **Fare:** Free for all verified student and faculty ID cardholders.`;
    } else if (lower.includes('cafeteria') || lower.includes('food') || lower.includes('lunch')) {
      reply = `🥗 **Central Food Court Today's Highlights:**\n\n• **Chef's Special:** Mediterranean Quinoa Power Bowl & Artisanal Panini\n• **Live Station:** Steamed Dim Sums & Fresh Fruit Smoothies\n• **Meal Hours:** Lunch served until 03:30 PM; Evening Snack Bar opens at 04:30 PM\n• **Digital Token:** Scan QR at kiosk or pay via Campus Card for zero queue.`;
    } else {
      reply = `Hello! I am your **Aegis Campus AI** companion. I can help you with:\n\n• 📍 Navigating to any classroom, computer lab, or lecture hall\n• 📅 Checking today's timetable, next lecture countdown, and attendance status\n• 👨‍🏫 Checking real-time faculty cabin status and booking quick consultation slots\n• 📢 Finding CIA exam timetables, academic notices, and duty leave workflows\n• 📶 Wi-Fi setup, library OPAC book searches, and cafeteria highlights\n\nWhat would you like assistance with right now?`;
    }

    return res.json({ reply, source: 'campus-engine', actionChip });
  } catch (error: any) {
    console.error('Error handling /api/chat:', error);
    res.status(500).json({ error: 'Internal server error processing campus query' });
  }
});

// Campus Status summary API
app.get('/api/campus-status', (_req, res) => {
  res.json({
    simsStatus: 'Online • SIMS Node 04',
    networkLoad: '42% Capacity',
    activePeriod: 'Period 4 (11:30 AM - 12:45 PM)',
    shuttleETA: '3 mins to Main Quad',
    weather: '24°C • Pleasant',
    activeSemester: 'Fall 2026',
  });
});
} // end mock routes (used only when BACKEND_URL is not set)

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus AI Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
