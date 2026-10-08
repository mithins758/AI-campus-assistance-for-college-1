// AI chat controller with a lightweight retrieval step.
// Never sends the raw prompt alone: relevant campus rows are fetched first.
const pool = require('../config/db');
const { validateAiPrompt } = require('../utils/validators');
const { generateCampusAnswer } = require('../services/geminiService');

// Build a small text context from Postgres for grounding.
async function buildCampusContext(prompt, userId) {
  const lower = prompt.toLowerCase();
  const parts = [];

  const wantsFaculty =
    /professor|faculty|sir|maam|ma'am|teacher|where is|cabin|leave|meeting|lecture/.test(
      lower
    );
  const wantsSchedule =
    /schedule|timetable|class|subject|lecture|lab|when|today|monday|tuesday|wednesday|thursday|friday|saturday/.test(
      lower
    );
  const wantsLocation =
    /where|room|lab|location|floor|building|classroom|office|library/.test(
      lower
    );

  try {
    if (wantsFaculty || (!wantsSchedule && !wantsLocation)) {
      const fac = await pool.query(
        `SELECT u.name, u.department, fs.status, l.code, l.name AS loc_name
         FROM users u
         JOIN faculty_status fs ON fs.faculty_id = u.id
         LEFT JOIN locations l ON l.id = fs.current_location_id
         WHERE u.role = 'faculty'
         ORDER BY u.name ASC
         LIMIT 20`
      );
      if (fac.rowCount > 0) {
        parts.push(
          'Faculty status:\n' +
            fac.rows
              .map(
                (r) =>
                  `- ${r.name} (${r.department || 'no dept'}): ${r.status}` +
                  (r.code ? ` at ${r.code} ${r.loc_name || ''}` : '')
              )
              .join('\n')
        );
      }
    }

    if (wantsLocation || wantsSchedule || parts.length === 0) {
      const locs = await pool.query(
        'SELECT code, name, type, floor FROM locations ORDER BY code ASC LIMIT 30'
      );
      if (locs.rowCount > 0) {
        parts.push(
          'Campus locations:\n' +
            locs.rows
              .map(
                (r) => `- ${r.code}: ${r.name} (${r.type}, floor ${r.floor})`
              )
              .join('\n')
        );
      }
    }

    // The asker's own timetable grounds "my class / my schedule" questions.
    if (userId) {
      const sched = await pool.query(
        `SELECT s.subject_name, s.day_of_week, s.start_time, s.end_time,
                l.code, l.name AS loc_name
         FROM schedules s
         JOIN locations l ON l.id = s.location_id
         WHERE s.user_id = $1
         ORDER BY s.day_of_week ASC, s.start_time ASC`,
        [userId]
      );
      if (sched.rowCount > 0) {
        const days = ['?', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        parts.push(
          'My timetable:\n' +
            sched.rows
              .map(
                (r) =>
                  `- ${r.subject_name}: ${days[r.day_of_week] || r.day_of_week} ` +
                  `${r.start_time}-${r.end_time} at ${r.code} ${r.loc_name}`
              )
              .join('\n')
        );
      }
    }
  } catch (err) {
    // Retrieval failure must not crash the request; continue with less context.
    console.error('AI context retrieval warning:', err.message);
  }

  return parts.join('\n\n');
}

// POST /api/chat
async function chat(req, res, next) {
  try {
    const errors = validateAiPrompt(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: errors[0], errors });
    }

    const prompt = req.body.prompt.trim();
    const context = await buildCampusContext(prompt, req.user.id);

    try {
      const answer = await generateCampusAnswer(prompt, context);
      return res.json({ success: true, data: { answer } });
    } catch (aiErr) {
      // Controlled failure: never crash, never leak SDK internals.
      console.error(
        'Gemini request failed:',
        aiErr && aiErr.message ? aiErr.message : aiErr
      );
      const status = aiErr.statusCode === 502 ? 502 : 503;
      return res.status(status).json({
        success: false,
        message: 'The AI assistant is temporarily unavailable',
      });
    }
  } catch (err) {
    return next(err);
  }
}

module.exports = { chat };
