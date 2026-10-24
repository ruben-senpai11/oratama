import React, { useState, useEffect, useRef } from 'react';
import { Book, RecordedVoice, ViewScreen } from '../types';
import booksData from '../data/books.json';
import { AudioRecorderService } from '../utils/audioRecorder';
import { deleteRecordedVoice, getRecordedVoice, saveRecordedVoice } from '../utils/audioStorage';
import { BookCover } from '../components/BookCover';

const allBooks: Book[] = booksData as Book[];

interface AuthorScreenProps {
  initialBookId?: string;
  onNavigate: (screen: ViewScreen) => void;
}

export const AuthorScreen: React.FC<AuthorScreenProps> = ({ initialBookId, onNavigate }) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId || allBooks[0].id);
  const [existingVoice, setExistingVoice] = useState<RecordedVoice | null>(null);

  // États d'enregistrement
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(30);

  // État du nouvel enregistrement en prévisualisation
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string>('');
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Notification d'état ou d'erreur
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorderService | null>(null);

  const selectedBook = allBooks.find((b) => b.id === selectedBookId) || allBooks[0];

  // Charger l'enregistrement existant dans IndexedDB
  const loadExistingVoice = async (bookId: string) => {
    const voice = await getRecordedVoice(bookId);
    setExistingVoice(voice);
    setPreviewBlob(null);
    setPreviewUrl(null);
  };

  useEffect(() => {
    recorderRef.current = new AudioRecorderService();
    loadExistingVoice(selectedBookId);

    return () => {
      recorderRef.current?.cancelRecording();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedBookId]);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setPreviewBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!recorderRef.current) return;

    const started = await recorderRef.current.startRecording({
      maxDurationSeconds: 30,
      onTimeUpdate: (elapsed, remaining) => {
        setElapsedSeconds(elapsed);
        setRemainingSeconds(remaining);
      },
      onComplete: (blob, mime, duration) => {
        setIsRecording(false);
        setPreviewBlob(blob);
        setPreviewMimeType(mime);
        setPreviewDuration(duration);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setStatusMessage('Enregistrement terminé ! Écoutez l’aperçu ci-dessous avant d’enregistrer.');
      },
      onError: (err) => {
        setIsRecording(false);
        setErrorMessage(err);
      },
    });

    if (started) {
      setIsRecording(true);
      setElapsedSeconds(0);
      setRemainingSeconds(30);
    }
  };

  const handleStopRecording = () => {
    recorderRef.current?.stopRecording();
    setIsRecording(false);
  };

  const handleSaveToIndexedDB = async () => {
    if (!previewBlob) return;

    try {
      const voiceRecord: RecordedVoice = {
        bookId: selectedBook.id,
        audioBlob: previewBlob,
        mimeType: previewMimeType,
        durationSeconds: previewDuration,
        createdAt: Date.now(),
      };

      await saveRecordedVoice(voiceRecord);
      setExistingVoice(voiceRecord);
      setPreviewBlob(null);
      setPreviewUrl(null);
      setStatusMessage('Votre voix d’auteur a bien été enregistrée sur votre appareil ! Elle remplace désormais la voix de synthèse.');
    } catch (e) {
      setErrorMessage('Erreur lors de la sauvegarde dans IndexedDB.');
    }
  };

  const handleDeleteVoice = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet enregistrement vocal de votre appareil ?')) {
      return;
    }

    try {
      await deleteRecordedVoice(selectedBook.id);
      setExistingVoice(null);
      setStatusMessage('Enregistrement supprimé. La voix de synthèse sera utilisée.');
    } catch (e) {
      setErrorMessage('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-5 pb-12">
      {/* En-tête */}
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-[#1F1A1A]">
          Espace Auteur
        </h1>
        <p className="text-xs text-[#5C5454] leading-relaxed">
          Enregistrez votre présentation en 30 secondes. Votre voix reste sur votre appareil et remplace la voix de synthèse.
        </p>
      </div>

      {/* Sélection du livre */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5DCD3] shadow-sm space-y-3">
        <label htmlFor="book-select" className="block text-xs font-bold uppercase tracking-wider text-[#5C5454]">
          1. Choisissez votre livre :
        </label>
        <select
          id="book-select"
          value={selectedBookId}
          onChange={(e) => setSelectedBookId(e.target.value)}
          className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#FAF6F1] border border-[#E5DCD3] rounded-xl text-[#1F1A1A] font-medium focus:border-[#933B40] focus:ring-1 focus:ring-[#933B40]"
        >
          {allBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.titre} — {b.auteur} ({b.pays})
            </option>
          ))}
        </select>

        {/* Aperçu rapide du livre sélectionné */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#E5DCD3]">
          <BookCover book={selectedBook} size="sm" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1F1A1A] truncate">{selectedBook.titre}</p>
            <p className="text-[11px] text-[#5C5454]">{selectedBook.auteur} · {selectedBook.pays}</p>
            <p className="text-[10px] text-[#8C8282]">{selectedBook.genre} · {selectedBook.prixFcfa} FCFA</p>
          </div>
        </div>
      </div>

      {/* Texte de présentation suggéré à lire (environ 70 mots, 30s) */}
      <section aria-labelledby="script-heading" className="bg-[#FAF6F1] rounded-2xl p-4 border border-[#E5DCD3] space-y-2">
        <div className="flex items-center justify-between">
          <h2 id="script-heading" className="text-xs font-bold uppercase tracking-wider text-[#933B40]">
            2. Texte à lire à voix haute (~70 mots) :
          </h2>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#E5DCD3] text-[#5C5454] font-semibold">
            30 secondes max
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#1F1A1A] italic bg-white p-3 rounded-xl border border-[#E5DCD3] leading-relaxed">
          « {selectedBook.presentationAuteur} »
        </p>
      </section>

      {/* Enregistrement et gestion de la voix */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5DCD3] shadow-sm space-y-4 text-center">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#5C5454]">
          3. Studio d’enregistrement local
        </h2>

        {/* Compteur temps / Compte à rebours */}
        <div className="space-y-1">
          <div className="text-3xl font-black text-[#1F1A1A] font-mono tracking-tight">
            00:{elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds}
            <span className="text-sm font-semibold text-[#8C8282] ml-1">/ 00:30</span>
          </div>
          {isRecording && (
            <p className="text-xs font-bold text-red-600 animate-pulse">
              ● Enregistrement en cours… ({remainingSeconds}s restantes)
            </p>
          )}
        </div>

        {/* Bouton d'enregistrement */}
        <div className="flex justify-center">
          {isRecording ? (
            <button
              type="button"
              onClick={handleStopRecording}
              aria-label="Arrêter l’enregistrement"
              className="min-h-[48px] px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 animate-pulse active:scale-95"
            >
              <rect className="w-4 h-4 bg-white rounded-sm" />
              <span>Arrêter l’enregistrement</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartRecording}
              aria-label="Démarrer l’enregistrement vocal"
              className="min-h-[48px] px-6 py-3 bg-[#933B40] hover:bg-[#752A2E] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>{existingVoice ? 'Réenregistrer / Remplacer' : 'Enregistrer ma voix (30s)'}</span>
            </button>
          )}
        </div>

        {/* Prévisualisation avant enregistrement définitif */}
        {previewUrl && !isRecording && (
          <div className="pt-3 border-t border-[#E5DCD3] space-y-3 text-left">
            <p className="text-xs font-bold text-[#1F1A1A]">
              🎧 Réécouter votre prise avant de l’enregistrer :
            </p>
            <audio controls src={previewUrl} className="w-full h-10" />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveToIndexedDB}
                className="flex-1 min-h-[44px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                ✓ Enregistrer sur cet appareil
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewBlob(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
                className="min-h-[44px] px-4 py-2 bg-[#FAF6F1] hover:bg-[#EFE8DE] text-[#5C5454] text-xs font-semibold rounded-xl border border-[#E5DCD3] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* État si un enregistrement existe déjà dans IndexedDB */}
        {existingVoice && !previewUrl && !isRecording && (
          <div className="pt-3 border-t border-[#E5DCD3] space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span>✓</span> Voix enregistrée active pour ce livre
              </span>
              <button
                type="button"
                onClick={handleDeleteVoice}
                className="text-xs text-red-600 hover:underline font-semibold min-h-[36px] px-2 flex items-center"
              >
                Supprimer
              </button>
            </div>

            <audio
              controls
              src={URL.createObjectURL(existingVoice.audioBlob)}
              className="w-full h-10"
            />

            <p className="text-[11px] text-[#8C8282] italic">
              Cette voix d’auteur personnalisée est désormais jouée sur la fiche du livre.
            </p>
          </div>
        )}

        {/* Message de statut */}
        {statusMessage && (
          <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            {statusMessage}
          </p>
        )}

        {/* Message d'erreur */}
        {errorMessage && (
          <p className="text-xs text-red-800 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Bouton pour aller voir la fiche du livre */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'book', bookId: selectedBook.id })}
          className="text-xs font-bold text-[#933B40] hover:underline min-h-[44px] inline-flex items-center"
        >
          Voir la fiche de « {selectedBook.titre} » →
        </button>
      </div>
    </div>
  );
};
