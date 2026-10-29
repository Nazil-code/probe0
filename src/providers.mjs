// Target adapters. Zero-dependency (uses Node 18+ built-in fetch).
// An adapter takes a user message (+ the configured system prompt / tools) and returns
// a normalized { reply, toolCalls:[{name,args}] } — the same shape the runner expects.
// API keys are read from environment variables only; never hardcoded or logged.

const TIMEOUT_MS = 30_000;

async function post(url, { headers, body }) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ac.signal });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

const withCode = (msg, code) => { const e = new Error(msg); e.code = code; return e; };

// Minimal JSON-schema for a tool's parameters (all string props, none required).
const paramsSchema = (t) => ({ type: 'object', properties: Object.fromEntries((t.params || ['input']).map((p) => [p, { type: 'string' }])), required: [] });

// --- Google Gemini --- https://ai.google.dev/api/generate-content
const GEMINI_DEFAULT_MODEL = 'gemini-2.0-flash';

export function makeGeminiAdapter(cfg) {
  const keyEnv = cfg.apiKeyEnv || 'GEMINI_API_KEY';
  const apiKey = process.env[keyEnv];
  if (!apiKey) throw withCode(`Missing API key. Set the ${keyEnv} environment variable before scanning a Gemini target.`, 'NO_KEY');
  const model = cfg.model || GEMINI_DEFAULT_MODEL;
  const tools = cfg.tools?.length ? [{ functionDeclarations: cfg.tools.map((t) => ({ name: t.name, description: t.description || t.name, parameters: paramsSchema(t) })) }] : undefined;

  return {
    name: `gemini:${model}`,
    authorized: cfg.authorized === true,
    ctx: { secret: cfg.canary, systemPrompt: cfg.systemPrompt, privilegedTools: (cfg.tools || []).filter((t) => t.privileged).map((t) => t.name), destructiveTools: (cfg.tools || []).filter((t) => t.destructive).map((t) => t.name) },
    async send(userMessage) {
      const body = {
        systemInstruction: { parts: [{ text: cfg.systemPrompt || '' }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0 }, // low temperature to reduce noise; the N-trial engine handles the rest
      };
      if (tools) body.tools = tools;
      // key sent as a header (not a URL query param) so it can't leak into logs/URLs
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const data = await post(url, { headers: { 'x-goog-api-key': apiKey }, body });
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const reply = parts.filter((p) => p.text).map((p) => p.text).join(' ').trim();
      const toolCalls = parts.filter((p) => p.functionCall).map((p) => ({ name: p.functionCall.name, args: p.functionCall.args || {} }));
      return { reply, toolCalls };
    },
  };
}

// --- Generic HTTP --- test an already-deployed chatbot endpoint you own (any backend / any model behind it).
export function makeHttpAdapter(cfg) {
  if (!cfg.url) throw withCode('HTTP target needs a "url".', 'CONFIG');
  const get = (obj, path) => path?.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  return {
    name: `http:${cfg.url}`,
    authorized: cfg.authorized === true,
    ctx: { secret: cfg.canary, systemPrompt: cfg.systemPrompt, privilegedTools: (cfg.tools || []).filter((t) => t.privileged).map((t) => t.name), destructiveTools: (cfg.tools || []).filter((t) => t.destructive).map((t) => t.name) },
    async send(userMessage) {
      const tmpl = JSON.stringify(cfg.bodyTemplate || { message: '{{attack}}' });
      const body = JSON.parse(tmpl.replaceAll('{{attack}}', userMessage.replace(/[\\"]/g, (m) => '\\' + m)));
      const data = await post(cfg.url, { headers: cfg.headers || {}, body });
      return {
        reply: String(get(data, cfg.replyPath || 'reply') ?? ''),
        toolCalls: get(data, cfg.toolCallsPath || 'toolCalls') || [],
      };
    },
  };
}
