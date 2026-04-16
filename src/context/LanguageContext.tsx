import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.learn': { en: 'Learn', es: 'Aprender' },
  'nav.lessons': { en: 'Lessons', es: 'Lecciones' },
  'nav.speakAndWrite': { en: 'Speaking and Writing', es: 'Hablar y Escribir' },
  'nav.grammar': { en: 'Grammar', es: 'Gramática' },
  'nav.culture': { en: 'Culture', es: 'Cultura' },
  'nav.community': { en: 'Community', es: 'Comunidad' },

  // Dashboard
  'dashboard.title': { en: 'Dashboard', es: 'Panel' },
  'dashboard.startLesson': { en: 'Start Lesson', es: 'Iniciar Lección' },
  'dashboard.wordsAndPhrases': { en: 'Words & Phrases', es: 'Palabras y Frases' },

  // Lesson flow
  'lesson.flashcard': { en: 'Flashcard', es: 'Tarjeta' },
  'lesson.listening': { en: 'Listening', es: 'Escuchar' },
  'lesson.speaking': { en: 'Speaking', es: 'Hablar' },
  'lesson.writing': { en: 'Writing', es: 'Escritura' },
  'lesson.multiChoice': { en: 'Multiple Choice', es: 'Opción Múltiple' },
  'lesson.listenWrite': { en: 'Listen & Write', es: 'Escuchar y Escribir' },
  'lesson.listenSpeak': { en: 'Listen & Speak', es: 'Escuchar y Hablar' },
  'lesson.complete': { en: 'Lesson Complete!', es: '¡Lección Completada!' },
  'lesson.home': { en: 'Home', es: 'Inicio' },
  'lesson.nextLesson': { en: 'Next Lesson', es: 'Siguiente Lección' },

  // Speak & Write
  'speakWrite.title': { en: 'Speak & Write', es: 'Hablar y Escribir' },
  'speakWrite.context': { en: 'Context', es: 'Contexto' },
  'speakWrite.help': { en: 'Help', es: 'Ayuda' },
  'speakWrite.showEnglish': { en: 'Show English', es: 'Mostrar Inglés' },
  'speakWrite.hideEnglish': { en: 'Hide English', es: 'Ocultar Inglés' },
  'speakWrite.clearChat': { en: 'Clear Chat', es: 'Borrar Chat' },
  'speakWrite.tapToSpeak': { en: 'Tap to speak', es: 'Toca para hablar' },
  'speakWrite.listening': { en: 'Listening...', es: 'Escuchando...' },

  // Roleplay complete
  'roleplay.complete': { en: 'Roleplay Complete!', es: '¡Juego de Roles Completado!' },
  'roleplay.summary': { en: 'Summary', es: 'Resumen' },
  'roleplay.reviewConversation': { en: 'Review Conversation', es: 'Revisar Conversación' },
  'roleplay.retryScenario': { en: 'Retry Scenario', es: 'Reintentar Escenario' },
  'roleplay.nextScenario': { en: 'Next Scenario', es: 'Siguiente Escenario' },
  'roleplay.difficultWords': { en: 'Difficult Words', es: 'Palabras Difíciles' },
  'roleplay.xpEarned': { en: 'XP Earned', es: 'XP Ganado' },
  'roleplay.duration': { en: 'Duration', es: 'Duración' },

  // Grammar
  'grammar.title': { en: 'Grammar', es: 'Gramática' },
  'grammar.pronouns': { en: 'Pronouns', es: 'Pronombres' },
  'grammar.hints': { en: 'Grammar Hints', es: 'Consejos Gramaticales' },

  // Culture
  'culture.title': { en: 'Culture', es: 'Cultura' },
  'culture.games': { en: 'Games', es: 'Juegos' },

  // Community
  'community.title': { en: 'The Community', es: 'La Comunidad' },
  'community.askQuestion': { en: 'Ask a Question', es: 'Hacer una Pregunta' },
  'community.search': { en: 'Search topics, questions, or grammar rules...', es: 'Buscar temas, preguntas o reglas gramaticales...' },

  // Badges
  'badges.title': { en: 'Badges', es: 'Insignias' },

  // Word Tiles game
  'tiles.title': { en: 'Word Tiles', es: 'Azulejos de Palabras' },
  'tiles.howToPlay': { en: 'How to Play', es: 'Cómo Jugar' },
  'tiles.play': { en: 'Play', es: 'Jugar' },
  'tiles.playAgain': { en: 'Play Again', es: 'Jugar de Nuevo' },
  'tiles.menu': { en: 'Menu', es: 'Menú' },

  // Settings
  'settings.title': { en: 'Settings', es: 'Ajustes' },
  'settings.language': { en: 'Interface Language', es: 'Idioma de Interfaz' },
  'settings.instructions': { en: 'Show Instructions', es: 'Mostrar Instrucciones' },
  'settings.instructionsHint': { en: 'Toggle off to hide helpful tips on all pages. You can re-enable this anytime in Settings.', es: 'Desactiva para ocultar consejos útiles en todas las páginas. Puedes reactivar esto en cualquier momento en Ajustes.' },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  showInstructions: boolean;
  setShowInstructions: (v: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: (key: string) => key,
  showInstructions: true,
  setShowInstructions: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('ui_language') as Language) || 'en';
  });
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const [showInstructions, setShowInstructionsState] = useState(() => {
    return localStorage.getItem('show_instructions') !== 'false';
  });

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'es' : 'en';
      localStorage.setItem('ui_language', next);
      return next;
    });
  }, []);

  const setShowInstructions = useCallback((v: boolean) => {
    localStorage.setItem('show_instructions', String(v));
    setShowInstructionsState(v);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, showInstructions, setShowInstructions }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
