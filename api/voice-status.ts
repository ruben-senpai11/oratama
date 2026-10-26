import fs from 'node:fs';
import path from 'node:path';

function resolveApiKey(): { apiKey: string; model: string } {
  let apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    '';

  let model = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || '';

  if (!apiKey) {
    const candidateFiles = ['.env', '.env.local', '.env.development', '.env.production'];
    for (const filename of candidateFiles) {
      try {
        const filePath = path.resolve(process.cwd(), filename);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          for (const rawLine of content.split('\n')) {
            const line = rawLine.trim();
            if (!line || line.startsWith('#')) continue;
            const eqIdx = line.indexOf('=');
            if (eqIdx > 0) {
              const varName = line.slice(0, eqIdx).trim().replace(/^export\s+/, '');
              let val = line.slice(eqIdx + 1).trim();
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
              }
              if (!apiKey && ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GEMINI_KEY', 'API_KEY', 'VITE_GEMINI_API_KEY'].includes(varName) && val) {
                apiKey = val;
              }
              if (!model && ['GEMINI_MODEL', 'VITE_GEMINI_MODEL'].includes(varName) && val) {
                model = val;
              }
            }
          }
        }
      } catch {
        // ignore
      }
      if (apiKey) break;
    }
  }

  return { apiKey, model: model || 'gemini-3.5-flash-lite' };
}

export default async function handler(_req: any, res: any) {
  const { apiKey, model } = resolveApiKey();
  res.status(200).json({
    available: Boolean(apiKey),
    model,
  });
}
