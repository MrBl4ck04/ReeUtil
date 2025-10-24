const crypto = require('crypto');

// Almacenamiento en memoria para captchas: id -> { text, expires }
const captchas = new Map();
const CAPTCHA_TTL_MS = 2 * 60 * 1000; // 2 minutos

function makeId() {
  return crypto.randomBytes(16).toString('hex');
}

function randomText(len = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function svgForText(text) {
  const width = 160, height = 60;
  const letters = text.split('').map((ch, i) => {
    const x = 20 + i * 25 + Math.random() * 5;
    const y = 35 + Math.random() * 10 - 5;
    const rotate = -20 + Math.random() * 40;
    const color = `hsl(${Math.floor(Math.random() * 360)},70%,40%)`;
    return `<text x="${x}" y="${y}" fill="${color}" font-size="28" font-family="Arial" transform="rotate(${rotate} ${x} ${y})">${ch}</text>`;
  }).join('');
  const noiseLines = Array.from({ length: 4 }).map(() => {
    const x1 = Math.random() * width, y1 = Math.random() * height;
    const x2 = Math.random() * width, y2 = Math.random() * height;
    const color = `rgba(0,0,0,0.${Math.floor(Math.random() * 5) + 2})`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#f3f4f6"/>${noiseLines}${letters}</svg>`;
}

function createCaptcha() {
  const id = makeId();
  const text = randomText(5);
  const svg = svgForText(text);
  const image = Buffer.from(svg).toString('base64');
  captchas.set(id, { text, expires: Date.now() + CAPTCHA_TTL_MS });
  return { id, image: `data:image/svg+xml;base64,${image}` };
}

function pruneExpired() {
  const now = Date.now();
  for (const [id, data] of captchas.entries()) {
    if (data.expires < now) captchas.delete(id);
  }
}

// Controller para obtener un captcha
const getCaptcha = (req, res) => {
  pruneExpired();
  const { id, image } = createCaptcha();
  res.status(200).json({ id, image });
};

// Función para validar captcha
const validateCaptcha = (captchaId, captchaValue) => {
  pruneExpired();
  const record = captchas.get(captchaId);
  if (!record) {
    return { valid: false, message: 'Captcha inválido o expirado.' };
  }
  const provided = String(captchaValue).trim().toUpperCase();
  if (provided !== record.text.toUpperCase()) {
    captchas.delete(captchaId);
    return { valid: false, message: 'Verificación captcha incorrecta.' };
  }
  // Consumir captcha para evitar reutilización
  captchas.delete(captchaId);
  return { valid: true };
};

module.exports = {
  getCaptcha,
  validateCaptcha,
  captchas
};
