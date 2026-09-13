const { createHash } = require('node:crypto');
const NUMBERS = ['50672161081', '50672161161', '50688007211'];
// Both fields live in one Redis hash: HSET commits assignment and next position together.
const ASSIGN = `
local prior = redis.call('HGET', KEYS[1], ARGV[1])
if prior then
  if string.sub(prior, 3) ~= ARGV[2] then return -1 end
  return tonumber(string.sub(prior, 1, 1))
end
local position = tonumber(redis.call('HGET', KEYS[1], 'next') or '0')
redis.call('HSET', KEYS[1], 'next', (position + 1) % 3, ARGV[1], position .. ':' .. ARGV[2])
return position`;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Solicitud no permitida.' });
  }
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: 'Revise los datos.' }); }
  const fields = ['nombre', 'telefono', 'marca', 'modelo', 'ano', 'motor', 'vin', 'repuesto', 'urgencia', 'preferencia', 'detalles'];
  const required = ['nombre', 'marca', 'modelo', 'ano', 'repuesto'];
  if (!body || !/^[a-f0-9-]{36}$/i.test(body.requestId || '') ||
      !body.fields || fields.some(k => typeof body.fields[k] !== 'string' || body.fields[k].length > 2000) ||
      required.some(k => !body.fields[k].trim())) {
    return res.status(400).json({ error: 'Revise los datos.' });
  }
  const digest = createHash('sha256').update(JSON.stringify(fields.map(k => body.fields[k].trim()))).digest('hex');
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) throw new Error('storage_unconfigured');
    const namespace = process.env.WHATSAPP_REDIS_KEY || 'repuestos-jr:whatsapp:v1';
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', ASSIGN, '1', namespace, `request:${body.requestId}`, digest]),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('storage_unavailable');
    const result = await response.json();
    if (result.result === -1) return res.status(409).json({ error: 'Revise los datos.' });
    if (result.error || !Number.isInteger(result.result) || !NUMBERS[result.result]) throw new Error('storage_result');
    return res.status(200).json({ number: NUMBERS[result.result] });
  } catch {
    // Never log submitted fields, connection URLs, tokens or provider responses.
    console.error('whatsapp_assignment_unavailable');
    return res.status(503).json({ number: NUMBERS[0] });
  }
};
