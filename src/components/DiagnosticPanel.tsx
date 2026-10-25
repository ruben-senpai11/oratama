import React, { useState, useEffect, useRef } from 'react';
import {
  detectBrowser,
  getMicrophonePermissionStatus,
  requestMicrophonePermission,
  isSpeechRecognitionSupported,
  subscribeDiagnosticEvents,
  DiagnosticEvent,
  SPEECH_ERROR_MESSAGES,
  BrowserDetectionResult,
  SpeechRecognitionService,
} from '../utils/speechRecognition';

interface DiagnosticPanelProps {
  onClose?: () => void;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ onClose }) => {
  const [browserInfo, setBrowserInfo] = useState<BrowserDetectionResult | null>(null);
  const [micPermission, setMicPermission] = useState<string>('vérification...');
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);
  const [isTestingSpeech, setIsTestingSpeech] = useState(false);
  const [testTranscript, setTestTranscript] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'errors' | 'logs'>('status');

  const testServiceRef = useRef<SpeechRecognitionService | null>(null);

  // Charger les informations système initiales
  const refreshSystemInfo = async () => {
    const bInfo = await detectBrowser();
    setBrowserInfo(bInfo);
    const perm = await getMicrophonePermissionStatus();
    setMicPermission(perm);
  };

  useEffect(() => {
    void refreshSystemInfo();

    // Souscrire aux événements de diagnostic en temps réel
    const unsubscribe = subscribeDiagnosticEvents((ev) => {
      setEvents((prev) => [ev, ...prev].slice(0, 30));
      // Si une permission a changé, actualiser le statut
      if (ev.type === 'mic-permission') {
        void getMicrophonePermissionStatus().then(setMicPermission);
      }
    });

    testServiceRef.current = new SpeechRecognitionService();

    return () => {
      unsubscribe();
      testServiceRef.current?.stop();
    };
  }, []);

  // Déclencher manuellement la demande de permission (crucial pour Brave)
  const handleRequestMic = async () => {
    const res = await requestMicrophonePermission();
    const perm = await getMicrophonePermissionStatus();
    setMicPermission(perm);
    if (!res.granted && browserInfo?.isBrave) {
      alert(
        "Navigateur Brave détecté :\nLe micro ou le service Google Speech peut être bloqué par vos boucliers Brave. Veuillez autoriser l'accès au micro dans la barre d'adresse (icône cadenas ou bouclier) pour tester la voix."
      );
    }
  };

  // Lancer un test réel de 5 secondes de reconnaissance vocale
  const handleTestSpeech = async () => {
    if (!testServiceRef.current) return;
    setIsTestingSpeech(true);
    setTestTranscript('');

    const started = await testServiceRef.current.start({
      onStart: () => {
        setIsTestingSpeech(true);
      },
      onInterimResult: (t) => {
        setTestTranscript(t);
      },
      onFinalResult: (t) => {
        setTestTranscript(t);
      },
      onError: (_type, _msg, rawCode) => {
        setIsTestingSpeech(false);
        if (rawCode === 'service-not-allowed' && browserInfo?.isBrave) {
          alert(
            "Brave bloque l'API Google Speech par défaut. Autorisez les services vocaux dans les paramètres de Brave ou utilisez la saisie textuelle."
          );
        }
      },
      onEnd: () => {
        setIsTestingSpeech(false);
      },
    });

    if (!started) {
      setIsTestingSpeech(false);
    } else {
      // Arrêt automatique après 6 secondes si pas arrêté plus tôt
      setTimeout(() => {
        testServiceRef.current?.stop();
        setIsTestingSpeech(false);
      }, 6000);
    }
  };

  const hasSpeech = isSpeechRecognitionSupported();

  if (isMinimized) {
    return (
      <aside
        aria-label="Mode diagnostic réduit"
        className="fixed bottom-3 right-3 z-50 bg-[#1F2A5C] text-white px-3 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#E9A23B]/60"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Diagnostic (?debug=1)</span>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="ml-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-[11px]"
          aria-label="Agrandir le panneau diagnostic"
        >
          Ouvrir
        </button>
      </aside>
    );
  }

  return (
    <aside
      role="region"
      aria-labelledby="diag-panel-title"
      className="fixed bottom-2 left-2 right-2 max-w-md mx-auto z-50 bg-[#FFFFFF] rounded-2xl shadow-2xl border-2 border-[#1F2A5C] text-[#1B1B2A] max-h-[85vh] flex flex-col overflow-hidden text-xs"
    >
      {/* Barre d'en-tête du diagnostic */}
      <div className="bg-[#1F2A5C] text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">🛠️</span>
          <div>
            <h2 id="diag-panel-title" className="font-bold text-xs tracking-wide">
              Mode Diagnostic Vocal · OraTama
            </h2>
            <p className="text-[10px] text-white/80">
              Paramètre actif : <code className="bg-white/20 px-1 py-0.2 rounded font-mono">?debug=1</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 text-white font-bold"
            title="Minimiser le panneau"
            aria-label="Minimiser le panneau diagnostic"
          >
            _
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 text-white font-bold text-base"
              title="Fermer le diagnostic"
              aria-label="Fermer le mode diagnostic"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Onglets de navigation interne */}
      <div className="flex border-b border-[#E8E3DA] bg-[#FBF8F3]">
        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`flex-1 min-h-[40px] font-bold text-center border-b-2 transition-colors ${
            activeTab === 'status'
              ? 'border-[#1F2A5C] text-[#1F2A5C] bg-white'
              : 'border-transparent text-[#6B6B7A] hover:text-[#1B1B2A]'
          }`}
        >
          État système
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('errors')}
          className={`flex-1 min-h-[40px] font-bold text-center border-b-2 transition-colors ${
            activeTab === 'errors'
              ? 'border-[#1F2A5C] text-[#1F2A5C] bg-white'
              : 'border-transparent text-[#6B6B7A] hover:text-[#1B1B2A]'
          }`}
        >
          Codes d'erreurs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex-1 min-h-[40px] font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'logs'
              ? 'border-[#1F2A5C] text-[#1F2A5C] bg-white'
              : 'border-transparent text-[#6B6B7A] hover:text-[#1B1B2A]'
          }`}
        >
          <span>Événements</span>
          {events.length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#1F2A5C] text-white text-[9px] rounded-full">
              {events.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="p-3 overflow-y-auto space-y-3 flex-1">
        {activeTab === 'status' && (
          <div className="space-y-3">
            {/* 1. Navigateur détecté */}
            <div className="p-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E3DA] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#6B6B7A] tracking-wider block">
                1. Navigateur détecté
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1B1B2A]">
                  {browserInfo?.name || 'Détection en cours...'}
                </span>
                {browserInfo?.isBrave && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold border border-orange-300">
                    Boucliers Brave actifs
                  </span>
                )}
              </div>
              {browserInfo?.details && (
                <p className="text-[11px] text-[#6B6B7A] leading-tight">
                  {browserInfo.details}
                </p>
              )}
            </div>

            {/* 2. Statut SpeechRecognition */}
            <div className="p-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E3DA] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#6B6B7A] tracking-wider block">
                2. API SpeechRecognition
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    hasSpeech ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                <span className="font-bold text-xs">
                  {hasSpeech ? 'Disponible dans ce navigateur' : 'Non supporté (Firefox / WebView sans Web Speech)'}
                </span>
              </div>
              <p className="text-[10px] text-[#6B6B7A]">
                Moteur : {hasSpeech ? 'webkitSpeechRecognition / SpeechRecognition standard' : 'Repli automatique sur champ texte'}
              </p>
            </div>

            {/* 3. Langue utilisée */}
            <div className="p-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E3DA] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B6B7A] tracking-wider block">
                  3. Langue de reconnaissance
                </span>
                <span className="font-bold text-xs text-[#1B1B2A]">fr-FR (Français)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#E8ECFA] text-[#1F2A5C] font-bold text-[10px]">
                Actif
              </span>
            </div>

            {/* 4. Statut Permission Micro & Actions */}
            <div className="p-2.5 rounded-xl bg-[#FBF8F3] border border-[#E8E3DA] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#6B6B7A] tracking-wider block">
                4. Permission Microphone Matériel
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      micPermission === 'accordée'
                        ? 'bg-emerald-500'
                        : micPermission === 'refusée'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-bold text-xs capitalize text-[#1B1B2A]">
                    {micPermission}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void handleRequestMic()}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#1F2A5C] text-white text-[11px] font-bold hover:bg-[#161E42] active:scale-95 transition-all shadow-sm"
                >
                  Demander la permission
                </button>
              </div>

              {browserInfo?.isBrave && (
                <div className="p-2 rounded-lg bg-[#FDF3E3] border border-[#E9A23B] text-[10px] text-[#1B1B2A] leading-relaxed">
                  <strong>💡 Conseil Brave :</strong> Si le test échoue avec <code className="bg-black/10 px-1 rounded">service-not-allowed</code>, ouvrez les paramètres Brave et autorisez les services vocaux Google, ou utilisez la saisie clavier.
                </div>
              )}
            </div>

            {/* Testeur en direct */}
            <div className="p-3 rounded-xl bg-white border-2 border-dashed border-[#1F2A5C]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1F2A5C]">
                  Tester l'écoute SpeechRecognition (5s) :
                </span>
                <button
                  type="button"
                  disabled={isTestingSpeech || !hasSpeech}
                  onClick={() => void handleTestSpeech()}
                  className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isTestingSpeech
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-[#1F2A5C] text-white hover:bg-[#161E42]'
                  } disabled:opacity-50`}
                >
                  {isTestingSpeech ? 'Écoute en cours...' : 'Lancer le test'}
                </button>
              </div>

              {isTestingSpeech && (
                <p className="text-[11px] text-amber-700 italic">
                  Parlez maintenant dans votre micro...
                </p>
              )}

              {testTranscript && (
                <div className="p-2 rounded bg-[#E8ECFA] text-xs font-medium text-[#1F2A5C]">
                  Reconnu : « {testTranscript} »
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Référence complète des codes d'erreur */}
        {activeTab === 'errors' && (
          <div className="space-y-2">
            <p className="text-[11px] text-[#6B6B7A] leading-snug">
              Chaque événement d'erreur émis par le navigateur possède un code normalisé et un message explicatif pour l'utilisateur :
            </p>

            <div className="space-y-2 pt-1">
              {Object.entries(SPEECH_ERROR_MESSAGES).map(([code, explanation]) => (
                <div
                  key={code}
                  className="p-2 rounded-xl border border-[#E8E3DA] bg-[#FBF8F3] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-[#1F2A5C] bg-white px-1.5 py-0.5 rounded border border-[#E8E3DA]">
                      {code}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-[#6B6B7A]">Code standard</span>
                  </div>
                  <p className="text-[11px] text-[#1B1B2A] leading-tight">
                    {explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Journal des événements en direct */}
        {activeTab === 'logs' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#6B6B7A]">
                Événements récents ({events.length}) :
              </span>
              <button
                type="button"
                onClick={() => setEvents([])}
                className="text-[10px] text-[#6B6B7A] hover:text-[#1B1B2A] underline"
              >
                Effacer le journal
              </button>
            </div>

            {events.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#6B6B7A] italic">
                Aucun événement vocal capturé pour le moment. Activez le micro pour observer les déclenchements en temps réel.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded-lg bg-[#FBF8F3] border border-[#E8E3DA] text-[11px] space-y-0.5 font-mono"
                  >
                    <div className="flex items-center justify-between text-[9px] text-[#6B6B7A]">
                      <span className="font-bold uppercase text-[#1F2A5C]">{ev.type}</span>
                      <span>{new Date(ev.timestamp).toLocaleTimeString('fr-FR')}</span>
                    </div>
                    {ev.code && (
                      <span className="inline-block px-1 py-0.2 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                        code: {ev.code}
                      </span>
                    )}
                    <p className="text-[#1B1B2A] font-sans text-[11px] leading-tight">
                      {ev.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Garantie de confidentialité & Pied du panneau */}
      <div className="bg-[#FBF8F3] p-2.5 border-t border-[#E8E3DA] flex items-center justify-between text-[10px] text-[#6B6B7A]">
        <div className="flex items-center gap-1">
          <span>🔒</span>
          <span>Zéro enregistrement · Zéro envoi externe</span>
        </div>
        <button
          type="button"
          onClick={() => void refreshSystemInfo()}
          className="underline font-bold text-[#1F2A5C]"
        >
          Actualiser
        </button>
      </div>
    </aside>
  );
};
