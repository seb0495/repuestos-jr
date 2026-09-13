const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');

async function run() {
  const source = fs.readFileSync('api/whatsapp.js', 'utf8');
  let next = 0;
  const requests = new Map();
  let calls = 0;
  const context = {
    module: { exports: {} }, require: () => crypto,
    process: { env: { UPSTASH_REDIS_REST_URL: 'https://example.invalid', UPSTASH_REDIS_REST_TOKEN: 'test' } },
    AbortSignal, console: { error() {} },
    fetch: async (_, options) => {
      calls++;
      const [, , , , id, digest] = JSON.parse(options.body);
      if (!requests.has(id)) { requests.set(id, { position: next, digest }); next = (next + 1) % 3; }
      const saved = requests.get(id);
      return { ok: true, json: async () => ({ result: saved.digest === digest ? saved.position : -1 }) };
    }
  };
  vm.runInNewContext(source, context);
  const fields = Object.fromEntries(['nombre','telefono','marca','modelo','ano','motor','vin','repuesto','urgencia','preferencia','detalles'].map(k => [k, 'Prueba á & #']));
  async function send(id = crypto.randomUUID(), data = fields) {
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { return { code: this.code, body }; } };
    return context.module.exports({ method: 'POST', body: { requestId: id, fields: data } }, res);
  }
  const numbers = [];
  for (let i = 0; i < 6; i++) numbers.push((await send()).body.number);
  assert.deepEqual(numbers, ['50672161081','50672161161','50688007211','50672161081','50672161161','50688007211']);
  assert.deepEqual((await Promise.all([send(), send()])).map(r => r.body.number), ['50672161081','50672161161']);
  const id = crypto.randomUUID();
  const repeated = await Promise.all([send(id), send(id)]);
  assert.equal(repeated[0].body.number, repeated[1].body.number);
  assert.equal((await send()).body.number, '50672161081');
  assert.equal((await send(id, { ...fields, nombre: 'Distinto' })).code, 409);
  const before = calls;
  assert.equal((await send(crypto.randomUUID(), { ...fields, nombre: '' })).code, 400);
  assert.equal(calls, before);
  context.fetch = async () => { throw new Error('private provider error'); };
  assert.equal((await send()).body.number, '50672161081');
  console.log('PASS: six assignments, concurrent requests, duplicate IDs, validation, conflict, fallback (mock storage).');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
