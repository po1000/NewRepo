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
  'lesson.quiz': { en: 'Quiz', es: 'Prueba' },
  'lesson.listening': { en: 'Listening', es: 'Escuchar' },
  'lesson.speaking': { en: 'Speaking', es: 'Hablar' },
  'lesson.writing': { en: 'Writing', es: 'Escritura' },
  'lesson.multiChoice': { en: 'Multiple Choice', es: 'Opción Múltiple' },
  'lesson.listenWrite': { en: 'Listen & Write', es: 'Escuchar y Escribir' },
  'lesson.listenSpeak': { en: 'Listen & Speak', es: 'Escuchar y Hablar' },
  'lesson.complete': { en: 'Lesson Complete!', es: '¡Lección Completada!' },
  'lesson.home': { en: 'Home', es: 'Inicio' },
  'lesson.nextLesson': { en: 'Next Lesson', es: 'Siguiente Lección' },
  'lesson.correct': { en: 'Correct!', es: '¡Correcto!' },
  'lesson.notQuite': { en: 'Not quite!', es: '¡Casi!' },
  'lesson.correctAnswer': { en: 'Correct answer:', es: 'Respuesta correcta:' },
  'lesson.continue': { en: 'Continue', es: 'Continuar' },
  'lesson.gotIt': { en: 'Got it!', es: '¡Entendido!' },
  'lesson.iKnowThis': { en: 'I know this', es: 'Ya lo sé' },
  'lesson.listenType': { en: 'Listen and type what you hear in Spanish', es: 'Escucha y escribe lo que oyes en español' },
  'lesson.listenRepeat': { en: 'Listen, then repeat what you hear', es: 'Escucha y repite lo que oyes' },
  'lesson.typeAnswer': { en: 'Type your answer...', es: 'Escribe tu respuesta...' },
  'lesson.submit': { en: 'Submit', es: 'Enviar' },
  'lesson.xpEarned': { en: 'XP Earned', es: 'XP Ganado' },
  'lesson.newTerms': { en: 'New Terms', es: 'Nuevos Términos' },
  'lesson.correctAnswers': { en: 'Correct Answers', es: 'Respuestas Correctas' },
  'lesson.dayStreak': { en: 'Day Streak', es: 'Racha de Días' },
  'lesson.wordsProgressed': { en: 'Words Progressed', es: 'Palabras Progresadas' },
  'lesson.loading': { en: 'Loading lessons...', es: 'Cargando lecciones...' },

  // Lesson statuses
  'status.notSeen': { en: 'Not Seen', es: 'No Visto' },
  'status.seen': { en: 'Seen', es: 'Visto' },
  'status.learning': { en: 'Learning', es: 'Aprendiendo' },
  'status.reinforced': { en: 'Reinforced', es: 'Reforzado' },
  'status.learnt': { en: 'Learnt', es: 'Aprendido' },

  // General UI
  'ui.signOut': { en: 'Sign Out', es: 'Cerrar Sesión' },
  'ui.search': { en: 'Search', es: 'Buscar' },
  'ui.loading': { en: 'Loading...', es: 'Cargando...' },
  'ui.back': { en: 'Back', es: 'Volver' },
  'ui.close': { en: 'Close', es: 'Cerrar' },
  'ui.welcome': { en: 'Welcome', es: 'Bienvenido' },
  'ui.welcomeBack': { en: 'Welcome Back', es: 'Bienvenido de Nuevo' },
  'ui.myBadges': { en: 'My Badges', es: 'Mis Insignias' },
  'ui.changePhoto': { en: 'Change Profile Photo', es: 'Cambiar Foto de Perfil' },
  'ui.uploading': { en: 'Uploading...', es: 'Subiendo...' },
  'ui.completed': { en: 'Completed!', es: '¡Completado!' },
  'ui.earned': { en: 'Earned', es: 'Ganado' },

  // Page headings
  'page.grammar': { en: 'Grammar', es: 'Gramática' },
  'page.culture': { en: 'Culture Area', es: 'Área Cultural' },
  'page.cultureSubtitle': { en: 'Discover the richness of Spanish traditions', es: 'Descubre la riqueza de las tradiciones españolas' },
  'page.speakWrite': { en: 'Practice Speaking and Writing', es: 'Practica Hablar y Escribir' },
  'page.speakWriteSubtitle': { en: 'Practise real-world conversations with interactive scenarios.', es: 'Practica conversaciones del mundo real con escenarios interactivos.' },
  'page.communitySubtitle': { en: 'Ask questions, share tips, and learn together with fellow Spanish learners', es: 'Haz preguntas, comparte consejos y aprende junto con otros estudiantes de español' },
  'page.startPractice': { en: 'Start Practice', es: 'Iniciar Práctica' },

  // Grammar page
  'grammar.conjugations': { en: 'Conjugations', es: 'Conjugaciones' },
  'grammar.topics': { en: 'Topics', es: 'Temas' },
  'grammar.searchTopics': { en: 'Search topics...', es: 'Buscar temas...' },
  'grammar.irregular': { en: 'Irregular', es: 'Irregular' },
  'grammar.singular': { en: 'Singular', es: 'Singular' },
  'grammar.plural': { en: 'Plural', es: 'Plural' },
  'grammar.pronounsCol': { en: 'Pronouns', es: 'Pronombres' },
  'grammar.searchVerbs': { en: 'Search verbs...', es: 'Buscar verbos...' },

  // Continue Lesson card
  'resume.continueLesson': { en: 'Continue Lesson', es: 'Continuar Lección' },
  'resume.xpReward': { en: 'XP Reward', es: 'Recompensa XP' },
  'resume.vocab': { en: 'Vocab:', es: 'Vocab:' },

  // SubunitDetailModal
  'modal.goal': { en: 'Goal:', es: 'Objetivo:' },
  'modal.noGrammarHints': { en: 'No grammar hints yet for this subunit.', es: 'Aún no hay consejos gramaticales para esta sublección.' },
  'modal.loadingTerms': { en: 'Loading terms...', es: 'Cargando términos...' },
  'modal.noTerms': { en: 'No terms found.', es: 'No se encontraron términos.' },

  // Badge labels
  'badge.completed': { en: 'Completed', es: 'Completado' },

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

  // CEFR Levels
  'cefr.Beginner': { en: 'Beginner', es: 'Principiante' },
  'cefr.Elementary': { en: 'Elementary', es: 'Elemental' },
  'cefr.Pre-Intermediate': { en: 'Pre-Intermediate', es: 'Pre-Intermedio' },

  // Structural labels
  'label.unit': { en: 'Unit', es: 'Unidad' },

  // A1 Unit titles
  'unit.First Impressions': { en: 'First Impressions', es: 'Primeras Impresiones' },
  'unit.Asking for Help': { en: 'Asking for Help', es: 'Pidiendo Ayuda' },
  'unit.Getting What You Need': { en: 'Getting What You Need', es: 'Consiguiendo Lo Que Necesitas' },
  'unit.Getting Around': { en: 'Getting Around', es: 'Moviéndote' },

  // A2 Unit titles
  'unit.Preferences & Who You Know': { en: 'Preferences & Who You Know', es: 'Preferencias y a Quién Conoces' },
  'unit.Your Routine': { en: 'Your Routine', es: 'Tu Rutina' },
  'unit.Plans and The Past': { en: 'Plans and The Past', es: 'Planes y el Pasado' },
  'unit.Life Admin': { en: 'Life Admin', es: 'Trámites' },

  // A1 Subunit titles
  'sub.Hola, How\'s It Going?': { en: 'Hola, How\'s It Going?', es: '¡Hola! ¿Cómo te va?' },
  'sub.Putting Names to Faces': { en: 'Putting Names to Faces', es: 'Poniendo Nombres a las Caras' },
  'sub.Lost in Translation': { en: 'Lost in Translation', es: 'Perdido en la Traducción' },
  'sub.Help is on the Way': { en: 'Help is on the Way', es: 'La Ayuda Viene en Camino' },
  'sub.Day at the Café': { en: 'Day at the Café', es: 'Un Día en el Café' },
  'sub.Map Mode': { en: 'Map Mode', es: 'Modo Mapa' },

  // A2 Subunit titles
  'sub.Relative Truths: Family': { en: 'Relative Truths: Family', es: 'Verdades Relativas: Familia' },
  'sub.Clock In, Clock Out': { en: 'Clock In, Clock Out', es: 'Fichar Entrada, Fichar Salida' },
  'sub.Last Weekend': { en: 'Last Weekend', es: 'El Fin de Semana Pasado' },
  'sub.Pay Up': { en: 'Pay Up', es: 'A Pagar' },
  'sub.Rinse and Repeat': { en: 'Rinse and Repeat', es: 'Repetir y Practicar' },
  'sub.Fill Me In': { en: 'Fill Me In', es: 'Ponme al Día' },
  'sub.Tap and Go': { en: 'Tap and Go', es: 'Toca y Avanza' },

  // Instructions / helper text
  'instructions.dashboard': { en: 'Tap any lesson tile to preview its vocabulary, then hit "Start Lesson" to begin. Lessons and units can be taken in any order!', es: '¡Toca cualquier lección para ver su vocabulario, luego presiona "Iniciar Lección" para empezar. ¡Las lecciones y unidades se pueden tomar en cualquier orden!' },
  'instructions.speakWrite': { en: 'Choose a scenario and practice having a real conversation in Spanish. Tap the microphone to speak, or type your response. The AI will respond naturally and help you improve.', es: 'Elige un escenario y practica una conversación real en español. Toca el micrófono para hablar o escribe tu respuesta. La IA responderá naturalmente y te ayudará a mejorar.' },
  'instructions.grammar': { en: 'Browse grammar topics organized by level. Tap any topic to see rules, examples, and conjugation tables. Practice what you learn in the lessons!', es: 'Explora temas de gramática organizados por nivel. Toca cualquier tema para ver reglas, ejemplos y tablas de conjugación. ¡Practica lo que aprendes en las lecciones!' },
  'instructions.culture': { en: 'Explore Spanish culture through articles, games, and fun facts. Play Word Tiles to practice vocabulary in a fun way!', es: '¡Explora la cultura española a través de artículos, juegos y datos curiosos. ¡Juega Azulejos de Palabras para practicar vocabulario de forma divertida!' },
  'instructions.community': { en: 'Ask questions, share tips, and connect with other Spanish learners. Filter by topic to find discussions that interest you.', es: 'Haz preguntas, comparte consejos y conéctate con otros estudiantes de español. Filtra por tema para encontrar discusiones que te interesen.' },
  'instructions.badges': { en: 'Earn badges by completing lessons, building streaks, and answering questions correctly. Track your progress toward each badge here!', es: '¡Gana insignias completando lecciones, manteniendo rachas y respondiendo preguntas correctamente. ¡Sigue tu progreso hacia cada insignia aquí!' },
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
