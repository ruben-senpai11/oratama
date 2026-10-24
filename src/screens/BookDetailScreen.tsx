import React, { useState, useEffect, useRef } from 'react';
import { Book, RecordedVoice, ViewScreen } from '../types';
import booksData from '../data/books.json';
import { BookCover } from '../components/BookCover';
import { getRecordedVoice } from '../utils/audioStorage';
import { getFrenchVoice } from '../utils/speechSynthesis';

const allBooks: Book[] = booksData as Book[];

interface BookDetailScreenProps {
  bookId: string;
  onNavigate: (screen: ViewScreen) => void;
}

export const BookDetailScreen: React.FC<BookDetailScreenProps> = ({ bookId, onNavigate }) => {
  const book = allBooks.find((b) => b.id === bookId);

  const [recordedVoice, setRecordedVoice] = useState<RecordedVoice | null>(null);
  const [isPlayingAuthorVoice, setIsPlayingAuthorVoice] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // 0 to 100%
  const [playbackTime, setPlaybackTime] = useState(0); // seconds
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthTimerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    getRecordedVoice(bookId).then((v) => {
      if (isMounted) {
        setRecordedVoice(v);
      }
    });

    return () => {
      isMounted = false;
      stopAllAudio();
    };
  }, [bookId]);

  if (!book) {
    return (
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-8 text-center space-y-4">
        <p className="text-sm font-bold text-[#1F1A1A]">Livre non trouvé</p>
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="min-h-[44px] px-4 py-2 bg-[#933B40] text-white text-xs font-semibold rounded-xl"
        >
          Retourner à l’accueil
        </button>
      </div>
    );
  }

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    setIsPlayingAuthorVoice(false);
    setAudioProgress(0);
    setPlaybackTime(0);
  };

  const handleToggleAuthorVoice = async () => {
    setVoiceNotice(null);

    if (isPlayingAuthorVoice) {
      stopAllAudio();
      return;
    }

    // Cas 1 : Enregistrement réel dans IndexedDB
    if (recordedVoice) {
      const audioUrl = URL.createObjectURL(recordedVoice.audioBlob);
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      } else {
        audioRef.current.src = audioUrl;
      }

      audioRef.current.onplay = () => setIsPlayingAuthorVoice(true);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const current = audioRef.current.currentTime;
          const duration = audioRef.current.duration || recordedVoice.durationSeconds || 30;
          setPlaybackTime(Math.floor(current));
          setAudioProgress((current / duration) * 100);
        }
      };
      audioRef.current.onended = () => {
        stopAllAudio();
      };
      audioRef.current.onerror = () => {
        setVoiceNotice('Erreur lors de la lecture de l’enregistrement audio.');
        stopAllAudio();
      };

      try {
        await audioRef.current.play();
      } catch (e) {
        setVoiceNotice('Lecture audio bloquée par le navigateur. Réessayez.');
        stopAllAudio();
      }
      return;
    }

    // Cas 2 : Voix de synthèse (démo)
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setVoiceNotice('La synthèse vocale n’est pas disponible sur ce navigateur.');
      return;
    }

    const voice = await getFrenchVoice();
    if (!voice) {
      setVoiceNotice('Aucune voix française disponible sur votre appareil pour la synthèse.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(book.presentationAuteur);
    utterance.voice = voice;
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;

    const estimatedDuration = 25; // ~25-30s pour ~70 mots
    let seconds = 0;

    utterance.onstart = () => {
      setIsPlayingAuthorVoice(true);
      synthTimerRef.current = setInterval(() => {
        seconds += 1;
        setPlaybackTime(seconds);
        setAudioProgress(Math.min(100, (seconds / estimatedDuration) * 100));
      }, 1000);
    };

    utterance.onend = () => {
      stopAllAudio();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        setVoiceNotice('Erreur de synthèse vocale.');
      }
      stopAllAudio();
    };

    synthUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-5 pb-12">
      {/* En-tête avec couverture CSS et infos principales */}
      <div className="flex gap-4 items-start">
        <BookCover book={book} size="md" className="shrink-0 shadow-lg" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#933B40] bg-[#F6EAEB] px-2 py-0.5 rounded-full">
            {book.genre}
          </span>
          <h1 className="text-base sm:text-lg font-black text-[#1F1A1A] leading-snug">
            {book.titre}
          </h1>
          <p className="text-xs font-semibold text-[#5C5454]">
            Par {book.auteur}
          </p>
          <p className="text-xs text-[#8C8282]">
            Origine : <span className="font-semibold text-[#1F1A1A]">{book.pays}</span>
          </p>
          <div className="pt-1 flex flex-wrap gap-2 text-xs font-bold text-[#1F1A1A]">
            <span className="bg-white px-2 py-1 rounded-lg border border-[#E5DCD3]">
              {book.pages} pages
            </span>
            <span className="bg-white px-2 py-1 rounded-lg border border-[#E5DCD3] text-[#933B40]">
              {book.prixFcfa.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Résumé original */}
      <section aria-labelledby="resume-heading" className="bg-white rounded-2xl p-4 border border-[#E5DCD3] shadow-sm space-y-2">
        <h2 id="resume-heading" className="text-xs font-bold uppercase tracking-wider text-[#5C5454]">
          Résumé
        </h2>
        <p className="text-xs sm:text-sm text-[#1F1A1A] leading-relaxed">
          {book.resume}
        </p>
        <div className="flex flex-wrap gap-1 pt-1">
          {book.themes.map((theme) => (
            <span
              key={theme}
              className="text-[10px] font-medium bg-[#FAF6F1] text-[#5C5454] px-2 py-0.5 rounded-md border border-[#E5DCD3]"
            >
              #{theme}
            </span>
          ))}
        </div>
      </section>

      {/* Lecteur de 30 secondes : « La voix de l'auteur » */}
      <section
        aria-labelledby="author-voice-heading"
        className="bg-gradient-to-br from-white to-[#F6EAEB]/40 rounded-2xl p-4 border border-[#933B40]/25 shadow-sm space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🎙️</span>
            <div>
              <h2 id="author-voice-heading" className="text-xs font-bold uppercase tracking-wider text-[#933B40]">
                La voix de l’auteur (30 secondes)
              </h2>
              <p className="text-[11px] text-[#5C5454]">
                L’auteur présente son livre de vive voix
              </p>
            </div>
          </div>

          {/* Badge voix de synthèse (démo) ou voix enregistrée */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              recordedVoice
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-purple-100 text-purple-800 border border-purple-200'
            }`}
          >
            {recordedVoice ? 'Voix enregistrée (locale)' : 'Voix de synthèse (démo)'}
          </span>
        </div>

        {/* Texte de la présentation (environ 70 mots) */}
        <blockquote className="text-xs italic text-[#5C5454] bg-white/80 p-3 rounded-xl border border-[#E5DCD3] leading-relaxed">
          « {book.presentationAuteur} »
        </blockquote>

        {/* Barre de progression audio */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-[#E5DCD3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#933B40] transition-all duration-300 rounded-full"
              style={{ width: `${audioProgress}%` }}
              aria-valuenow={audioProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-[#8C8282]">
            <span>0:{playbackTime < 10 ? `0${playbackTime}` : playbackTime}</span>
            <span>0:{recordedVoice ? Math.round(recordedVoice.durationSeconds) : '25'}</span>
          </div>
        </div>

        {/* Bouton de lecture 30s */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleToggleAuthorVoice}
            aria-label={isPlayingAuthorVoice ? 'Arrêter la présentation de l’auteur' : 'Écouter la présentation de l’auteur'}
            className="min-h-[44px] px-4 py-2.5 bg-[#933B40] hover:bg-[#752A2E] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            {isPlayingAuthorVoice ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                <span>Arrêter l’écoute</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Écouter la voix ({recordedVoice ? 'audio' : 'synthèse'})</span>
              </>
            )}
          </button>

          {/* Raccourci vers Espace Auteur */}
          <button
            type="button"
            onClick={() => onNavigate({ name: 'author', bookId: book.id })}
            className="text-[11px] text-[#933B40] hover:underline font-semibold min-h-[44px] flex items-center"
          >
            {recordedVoice ? 'Remplacer l’audio →' : 'Enregistrer ma voix d’auteur →'}
          </button>
        </div>

        {voiceNotice && (
          <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
            {voiceNotice}
          </p>
        )}
      </section>

      {/* Extrait original du livre (~120 mots) */}
      <section aria-labelledby="extrait-heading" className="bg-white rounded-2xl p-4 border border-[#E5DCD3] shadow-sm space-y-2">
        <h2 id="extrait-heading" className="text-xs font-bold uppercase tracking-wider text-[#5C5454]">
          Extrait du livre (~120 mots)
        </h2>
        <p className="text-xs sm:text-sm text-[#1F1A1A] leading-relaxed italic bg-[#FAF6F1] p-3.5 rounded-xl border border-[#E5DCD3]">
          {book.extrait}
        </p>
      </section>

      {/* Bouton principal "Lire à voix haute" */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            stopAllAudio();
            onNavigate({ name: 'reader', bookId: book.id });
          }}
          className="w-full min-h-[48px] px-6 py-3.5 bg-[#933B40] hover:bg-[#752A2E] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <span aria-hidden="true">📖</span>
          <span>Lire cet extrait à voix haute</span>
        </button>
      </div>
    </div>
  );
};
