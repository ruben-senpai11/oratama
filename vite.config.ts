/// <reference types="vitest" />
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function voiceSearchApiPlugin(apiKey: string, defaultModel = 'gemini-3.5-flash-lite'): Plugin {
  const candidateModels = Array.from(
    new Set([
      defaultModel,
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.5-flash',
    ])
  );

  const setupMiddlewares = (server: any) => {
    server.middlewares.use('/api/voice-status', (_req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          available: Boolean(apiKey),
          model: candidateModels[0],
        })
      );
    });

    server.middlewares.use('/api/voice-search', (req: any, res: any, next: any) => {
      if (req.method !== 'POST') {
        return next();
      }

      if (!apiKey) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Le service vocal Gemini n’est pas configuré sur le serveur (clé manquante).',
          })
        );
        return;
      }

      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body);
          const { audioBase64, mimeType } = parsed;

          if (!audioBase64) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Données audio manquantes.' }));
            return;
          }

          const prompt = `Tu es l'assistant vocal intelligent d'OraTama, la bibliothèque africaine orale.
Écoute attentivement cet enregistrement audio en français (qui peut comporter des accents ouest-africains, des noms de villes ou pays d'Afrique comme Cotonou, Porto-Novo, Ganvié, Abidjan, Dakar, Lomé, Bamako, etc., des titres de livres, des genres littéraires ou des termes en langues locales comme le fon, yoruba, wolof).

Mission :
1. Transcris fidèlement la totalité des propos de l'utilisateur.
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

IMPORTANT : Ne renvoie que le JSON pur, sans balises de code markdown ni texte avant ou après.`;

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
                            data: audioBase64,
                          },
                        },
                        { text: prompt },
                      ],
                    },
                  ],
                  generationConfig: {
                    temperature: 0.1,
                    responseMimeType: 'application/json',
                  },
                }),
                signal: AbortSignal.timeout(10000),
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
              break; // Succès !
            } catch (modelErr: any) {
              lastErrorMessage = modelErr?.message || 'Erreur réseau vers Gemini';
            }
          }

          if (!extractedData) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: lastErrorMessage || 'Échec de transcription avec l’ensemble des modèles IA.' }));
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: true,
              data: {
                transcript: extractedData.transcript || '',
                searchTerms: extractedData.searchTerms || extractedData.transcript || '',
                genre: extractedData.genre || null,
                longueur: extractedData.longueur || null,
                pays: extractedData.pays || null,
                themes: Array.isArray(extractedData.themes) ? extractedData.themes : [],
                maxPrixFcfa: typeof extractedData.maxPrixFcfa === 'number' ? extractedData.maxPrixFcfa : null,
              },
            })
          );
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Erreur serveur lors du traitement audio.' }));
        }
      });
    });
  };

  return {
    name: 'voice-search-api',
    configureServer(server) {
      setupMiddlewares(server);
    },
    configurePreviewServer(server) {
      setupMiddlewares(server);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  const model = env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  return {
    plugins: [
      react(),
      voiceSearchApiPlugin(apiKey, model),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'robots.txt',
          'apple-touch-icon.png',
          'icons/icon-192.png',
          'icons/icon-512.png',
          'icons/icon-192.svg',
          'icons/icon-512.svg',
          'images/alban-avatar.jpg',
        ],
        manifest: {
          name: 'OraTama',
          short_name: 'OraTama',
          description: 'Concept vocal non officiel pour une bibliothèque africaine',
          theme_color: '#1F2A5C',
          background_color: '#FBF8F3',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icons/icon-192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
            {
              src: '/icons/icon-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,jpg,json}'],
          runtimeCaching: [
            {
              urlPattern: ({ request }) =>
                request.destination === 'document' ||
                request.destination === 'script' ||
                request.destination === 'style' ||
                request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'oratama-static-assets',
              },
            },
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'node',
    },
  };
});
