/**
 * Endpoint Serverless pour Vercel / Netlify
 * Traite la recherche vocale via Gemini Flash en toute sécurité côté serveur
 * avec bascule de résilience multi-modèles (gemini-3.5-flash-lite, etc.).
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  if (!apiKey) {
    res.status(503).json({
      error: 'Le service vocal Gemini n’est pas configuré sur le serveur (clé manquante).'
    });
    return;
  }

  try {
    const { audioBase64, mimeType } = req.body || {};

    if (!audioBase64) {
      res.status(400).json({ error: 'Données audio manquantes.' });
      return;
    }

    const prompt = `Tu es l'assistant vocal intelligent d'OraTama, la bibliothèque africaine orale.
Écoute attentivement cet enregistrement audio en français (qui peut comporter des accents ouest-africains, des noms de villes ou pays d'Afrique comme Cotonou, Porto-Novo, Ganvié, Abidjan, Dakar, Lomé, Bamako, etc., des titres de livres, des genres littéraires ou des termes en langues locales comme le fon, yoruba, wolof).

Mission :
1. Transcris fidèlement la totalité des propos de l'utilisateur dans le champ "transcript". Même si l'enregistrement est court ou comporte du bruit ambiant, fais de ton mieux pour transcrire les paroles prononcées.
2. Analyse sa demande pour en extraire les critères de recherche littéraire dans la bibliothèque OraTama.

Réponds STRICTEMENT avec un objet JSON valide respectant cette structure :
{
  "transcript": "Transcription exacte et fidèle de ce que dit l'utilisateur",
  "searchTerms": "mots-clés principaux pour rechercher dans les titres, résumés et auteurs",
  "genre": "roman" | "conte" | "poésie" | "essai" | "théâtre" | "jeunesse" | null,
  "longueur": "court" | "moyen" | "long" | null,
  "pays": "Bénin" | "Sénégal" | "Côte d’Ivoire" | "Cameroun" | "Togo" | "Mali" | "Guinée" | "Congo" | "Burkina Faso" | "Gabon" | null,
  "themes": ["amour", "nature", "mémoire", "ville", "famille", "histoire", "société", "philosophie"],
  "maxPrixFcfa": nombre ou null
}

IMPORTANT : Ne renvoie que le JSON pur, sans balises de code markdown ni texte avant ou après. Ne laisse "transcript" vide que si l'audio est un silence absolu.`;

    const candidateModels = Array.from(
      new Set([
        preferredModel,
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.5-flash',
      ])
    );

    let lastErrorMessage = '';
    let extractedData: any = null;

    for (const modelToTry of candidateModels) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: (mimeType || 'audio/webm').split(';')[0],
                      data: audioBase64
                    }
                  },
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (!geminiRes.ok) {
          const errData = await geminiRes.json().catch(() => null);
          lastErrorMessage = errData?.error?.message || `Erreur Gemini (${geminiRes.status})`;
          continue;
        }

        const geminiData = await geminiRes.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          lastErrorMessage = 'Gemini n’a renvoyé aucune transcription.';
          continue;
        }

        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        extractedData = JSON.parse(cleaned);
        break;
      } catch (err: any) {
        lastErrorMessage = err?.message || 'Erreur réseau vers Gemini';
      }
    }

    if (!extractedData) {
      res.status(502).json({ error: lastErrorMessage || 'Échec de transcription avec l’ensemble des modèles IA.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        transcript: extractedData.transcript || '',
        searchTerms: extractedData.searchTerms || extractedData.transcript || '',
        genre: extractedData.genre || null,
        longueur: extractedData.longueur || null,
        pays: extractedData.pays || null,
        themes: Array.isArray(extractedData.themes) ? extractedData.themes : [],
        maxPrixFcfa: typeof extractedData.maxPrixFcfa === 'number' ? extractedData.maxPrixFcfa : null,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur serveur lors du traitement audio.' });
  }
}
