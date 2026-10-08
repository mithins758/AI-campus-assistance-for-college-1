// Simple reusable validators. No heavy framework needed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LOCATION_CODE_RE = /^[A-Z0-9-]{2,50}$/i;

const VALID_ROLES = ['student', 'faculty', 'admin'];
const PUBLIC_REGISTER_ROLES = ['student', 'faculty'];
const VALID_STATUSES = ['in-cabin', 'in-lecture', 'on-leave', 'in-meeting'];

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

function isUUID(value) {
  return typeof value === 'string' && UUID_RE.test(value.trim());
}

function isValidLocationCode(code) {
  return typeof code === 'string' && LOCATION_CODE_RE.test(code.trim());
}

function validateRegister(body) {
  const errors = [];
  const { name, email, password, role } = body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name must be at most 100 characters');
  }

  if (!isValidEmail(email)) {
    errors.push('A valid email is required');
  }

  if (typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    errors.push('Role must be one of: student, faculty, admin');
  }

  // Public registration must never create an admin.
  if (role === 'admin') {
    errors.push('Admin accounts cannot be created via public registration');
  }

  if (
    body &&
    body.department !== undefined &&
    body.department !== null &&
    (typeof body.department !== 'string' || body.department.length > 100)
  ) {
    errors.push('Department must be a string of at most 100 characters');
  }

  return errors;
}

function validateLogin(body) {
  const errors = [];
  if (!isValidEmail(body && body.email)) {
    errors.push('A valid email is required');
  }
  if (!body || typeof body.password !== 'string' || !body.password) {
    errors.push('Password is required');
  }
  return errors;
}

function validateFacultyStatus(body) {
  const errors = [];
  if (!body || !VALID_STATUSES.includes(body.status)) {
    errors.push(
      `Status must be one of: ${VALID_STATUSES.join(', ')}`
    );
  }
  if (
    body &&
    body.current_location_id !== undefined &&
    body.current_location_id !== null &&
    !isUUID(body.current_location_id)
  ) {
    errors.push('current_location_id must be a valid UUID or null');
  }
  return errors;
}

function validateAiPrompt(body) {
  const errors = [];
  const prompt = body && body.prompt;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    errors.push('Prompt must be a non-empty string');
  } else if (prompt.length > 1000) {
    errors.push('Prompt must be at most 1000 characters');
  }
  return errors;
}

module.exports = {
  VALID_ROLES,
  PUBLIC_REGISTER_ROLES,
  VALID_STATUSES,
  isValidEmail,
  isUUID,
  isValidLocationCode,
  validateRegister,
  validateLogin,
  validateFacultyStatus,
  validateAiPrompt,
};
