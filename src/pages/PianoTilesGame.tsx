import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Trophy, Zap } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// ── Song Data ──────────────────────────────────────────────
// Each beat has the Spanish word and its English translation.
// The game shows ONE as the prompt; the player picks the correct
// tile from 4 columns. Tiles scroll down; you tap the right one.

interface SongBeat {
  spanish: string;
  english: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number; // beats per minute — controls tile speed
  beats: SongBeat[];
  // Audio frequencies for a simple melody (Web Audio)
  notes: number[];
}

const SONGS: Song[] = [
  {
    id: 'despacito',
    title: 'Despacito',
    artist: 'Luis Fonsi',
    bpm: 89,
    beats: [
      { spanish: 'lento', english: 'slowly' },
      { spanish: 'corazón', english: 'heart' },
      { spanish: 'respirar', english: 'to breathe' },
      { spanish: 'besar', english: 'to kiss' },
      { spanish: 'paredes', english: 'walls' },
      { spanish: 'laberinto', english: 'labyrinth' },
      { spanish: 'favorito', english: 'favourite' },
      { spanish: 'firma', english: 'signature' },
      { spanish: 'cuello', english: 'neck' },
      { spanish: 'susurro', english: 'whisper' },
      { spanish: 'bonito', english: 'beautiful' },
      { spanish: 'pasito', english: 'little step' },
      { spanish: 'poquito', english: 'a little bit' },
      { spanish: 'pegado', english: 'stuck' },
      { spanish: 'ritmo', english: 'rhythm' },
      { spanish: 'oído', english: 'ear' },
      { spanish: 'locura', english: 'craziness' },
      { spanish: 'suave', english: 'smooth' },
      { spanish: 'subir', english: 'to go up' },
      { spanish: 'bailar', english: 'to dance' },
      { spanish: 'quiero', english: 'I want' },
      { spanish: 'contigo', english: 'with you' },
      { spanish: 'sentir', english: 'to feel' },
      { spanish: 'cuerpo', english: 'body' },
      { spanish: 'playa', english: 'beach' },
      { spanish: 'noche', english: 'night' },
      { spanish: 'boca', english: 'mouth' },
      { spanish: 'grito', english: 'scream' },
      { spanish: 'manos', english: 'hands' },
      { spanish: 'pelo', english: 'hair' },
      { spanish: 'mirada', english: 'gaze' },
      { spanish: 'momento', english: 'moment' },
    ],
    // Simplified "Despacito" melody — C major pentatonic feel
    notes: [
      261, 293, 329, 349, 392, 349, 329, 293,
      261, 293, 329, 349, 392, 440, 392, 349,
      329, 349, 392, 440, 493, 440, 392, 349,
      329, 293, 261, 293, 329, 349, 329, 293,
    ],
  },
];

// Distractor pool — extra words to fill wrong tiles
const DISTRACTORS_ES = [
  'casa', 'perro', 'gato', 'agua', 'fuego', 'libro', 'mesa',
  'silla', 'puerta', 'ventana', 'luz', 'tiempo', 'dinero',
  'ciudad', 'calle', 'comida', 'amigo', 'mundo', 'vida',
  'sol', 'luna', 'estrella', 'cielo', 'mar', 'tierra',
];
const DISTRACTORS_EN = [
  'house', 'dog', 'cat', 'water', 'fire', 'book', 'table',
  'chair', 'door', 'window', 'light', 'time', 'money',
  'city', 'street', 'food', 'friend', 'world', 'life',
  'sun', 'moon', 'star', 'sky', 'sea', 'earth',
];

const NUM_COLS = 4;
const TILE_HEIGHT = 80;
const VISIBLE_ROWS = 6;
const CANVAS_H = TILE_HEIGHT * VISIBLE_ROWS;

const XP_PER_TILE = 2;

// ── Game Component ─────────────────────────────────────────

type TileMode = 'spanish' | 'english';
type GameState = 'menu' | 'playing' | 'gameover';

interface TileData {
  id: number;
  col: number;      // 0-3
  y: number;         // current pixel Y
  label: string;     // text shown on tile
  correct: boolean;  // is this the right answer?
  prompt: string;    // the word shown at top
  tapped: boolean;
}

export function PianoTilesGame() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gameState, setGameState] = useState<GameState>('menu');
  const [tileMode, setTileMode] = useState<TileMode>('english');
  const [selectedSong, setSelectedSong] = useState(SONGS[0]);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [prompt, setPrompt] = useState('');
  const [gameOverMsg, setGameOverMsg] = useState('');
  const [earnedXp, setEarnedXp] = useState(0);

  const animRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const tileIdRef = useRef(0);
  const beatIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load high score
  useEffect(() => {
    const key = `piano_tiles_hs_${user?.id || 'guest'}_${selectedSong.id}`;
    const saved = localStorage.getItem(key);
    if (saved) setHighScore(parseInt(saved, 10));
  }, [user, selectedSong.id]);

  // Play a note (Web Audio)
  const playNote = useCallback((freq: number, duration = 0.2) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  const playWrongSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, []);

  // Spawn a row of tiles for the current beat
  const spawnRow = useCallback((beatIdx: number): TileData[] => {
    const song = selectedSong;
    if (beatIdx >= song.beats.length) return [];

    const beat = song.beats[beatIdx];
    const correctCol = Math.floor(Math.random() * NUM_COLS);

    // Pick distractors
    const distractorPool = tileMode === 'english' ? [...DISTRACTORS_EN] : [...DISTRACTORS_ES];
    // Remove the correct answer from distractors
    const correctLabel = tileMode === 'english' ? beat.english : beat.spanish;
    const promptLabel = tileMode === 'english' ? beat.spanish : beat.english;
    const filtered = distractorPool.filter(d => d !== correctLabel);

    // Shuffle and pick 3
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    const distractors = filtered.slice(0, NUM_COLS - 1);

    const newTiles: TileData[] = [];
    let dIdx = 0;
    for (let col = 0; col < NUM_COLS; col++) {
      const isCorrect = col === correctCol;
      tileIdRef.current++;
      newTiles.push({
        id: tileIdRef.current,
        col,
        y: -TILE_HEIGHT, // start above visible area
        label: isCorrect ? correctLabel : distractors[dIdx++],
        correct: isCorrect,
        prompt: promptLabel,
        tapped: false,
      });
    }

    return newTiles;
  }, [selectedSong, tileMode]);

  // Start game
  const startGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setCurrentBeatIndex(0);
    beatIndexRef.current = 0;
    tileIdRef.current = 0;
    setEarnedXp(0);
    setGameOverMsg('');

    // Spawn first row
    const firstRow = spawnRow(0);
    if (firstRow.length > 0) {
      setPrompt(firstRow[0].prompt);
      setTiles(firstRow);
    }
    beatIndexRef.current = 1;
    setCurrentBeatIndex(1);

    lastTimeRef.current = 0;
    setGameState('playing');
  }, [spawnRow]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const speed = (selectedSong.bpm / 60) * TILE_HEIGHT; // pixels per second

    function tick(timestamp: number) {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setTiles(prev => {
        const updated = prev.map(t => ({ ...t, y: t.y + speed * dt }));

        // Check if any untapped correct tile has scrolled past the bottom
        const missed = updated.find(t => t.correct && !t.tapped && t.y > CANVAS_H);
        if (missed) {
          // Game over — missed a tile
          endGame('You missed a tile!');
          return updated;
        }

        // Remove tiles that are fully off-screen (tapped or wrong)
        return updated.filter(t => t.y < CANVAS_H + TILE_HEIGHT);
      });

      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, selectedSong.bpm]);

  // Spawn new rows when previous row is at ~middle of screen
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTiles(prev => {
        // Check if we need a new row: no row is currently near the top
        const topMostY = prev.length > 0 ? Math.min(...prev.map(t => t.y)) : CANVAS_H;
        if (topMostY > TILE_HEIGHT * 1.5 && beatIndexRef.current < selectedSong.beats.length) {
          const newRow = spawnRow(beatIndexRef.current);
          if (newRow.length > 0) {
            setPrompt(newRow[0].prompt);
            beatIndexRef.current++;
            setCurrentBeatIndex(beatIndexRef.current);
            return [...prev, ...newRow];
          }
        }
        // If all beats done and no tiles left, song complete!
        if (beatIndexRef.current >= selectedSong.beats.length && prev.filter(t => !t.tapped && t.correct).length === 0) {
          endGame('Song complete!');
        }
        return prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameState, selectedSong, spawnRow]);

  const endGame = useCallback((msg: string) => {
    cancelAnimationFrame(animRef.current);
    setGameOverMsg(msg);
    setGameState('gameover');

    const finalScore = scoreRef.current;
    const xp = finalScore * XP_PER_TILE;
    setEarnedXp(xp);

    // Save high score
    const key = `piano_tiles_hs_${user?.id || 'guest'}_${selectedSong.id}`;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    if (finalScore > prev) {
      localStorage.setItem(key, String(finalScore));
      setHighScore(finalScore);
    }

    // Award XP to database
    if (user && xp > 0) {
      (async () => {
        const { data: stats } = await supabase
          .from('user_stats')
          .select('total_xp')
          .eq('user_id', user.id)
          .single();
        const currentXp = stats?.total_xp || 0;
        await supabase.from('user_stats').upsert({
          user_id: user.id,
          total_xp: currentXp + xp,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        await supabase.from('xp_events').insert({
          user_id: user.id,
          xp_amount: xp,
          source_type: 'game',
          source_id: selectedSong.id,
        });
      })();
    }
  }, [user, selectedSong.id]);

  // Handle tile tap
  const handleTileTap = useCallback((tileId: number) => {
    if (gameState !== 'playing') return;

    setTiles(prev => {
      const tile = prev.find(t => t.id === tileId);
      if (!tile || tile.tapped) return prev;

      if (tile.correct) {
        // Play the note
        const noteIdx = scoreRef.current % selectedSong.notes.length;
        playNote(selectedSong.notes[noteIdx], 0.25);
        scoreRef.current++;
        setScore(scoreRef.current);

        // Mark all tiles in this "row group" as tapped
        return prev.map(t => {
          if (Math.abs(t.y - tile.y) < 10) {
            return { ...t, tapped: true };
          }
          return t;
        });
      } else {
        // Wrong tile — game over
        playWrongSound();
        endGame('Wrong tile!');
        return prev;
      }
    });
  }, [gameState, selectedSong, playNote, playWrongSound, endGame]);

  // ── MENU ────────────────────────────────────────────────
  if (gameState === 'menu') {
    return (
      <PageLayout backgroundColor="#1a1a2e">
        <div className="max-w-[500px] mx-auto px-4 pt-8 pb-20">
          <button onClick={() => navigate('/culture')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[14px]">Back to Culture</span>
          </button>

          <h1 className="font-bold text-[28px] text-white text-center mb-2">Word Tiles</h1>
          <p className="text-white/60 text-center text-[14px] mb-8">Tap the correct translation to the beat!</p>

          {/* Song Selection */}
          <div className="mb-6">
            <p className="text-white/80 text-[13px] font-semibold mb-3">Select a Song</p>
            {SONGS.map(song => (
              <button key={song.id}
                onClick={() => setSelectedSong(song)}
                className={`w-full p-4 rounded-xl mb-2 flex items-center justify-between transition-all ${
                  selectedSong.id === song.id
                    ? 'bg-gradient-to-r from-[#FF4D01] to-[#FF8C00] text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}>
                <div>
                  <p className="font-bold text-[16px]">{song.title}</p>
                  <p className="text-[12px] opacity-70">{song.artist} · {song.beats.length} words</p>
                </div>
                <Play className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Mode Selection */}
          <div className="mb-8">
            <p className="text-white/80 text-[13px] font-semibold mb-3">Tile Language</p>
            <div className="flex gap-3">
              <button onClick={() => setTileMode('english')}
                className={`flex-1 py-3 rounded-xl font-bold text-[14px] transition-all ${
                  tileMode === 'english'
                    ? 'bg-[#FF4D01] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}>
                English Tiles
              </button>
              <button onClick={() => setTileMode('spanish')}
                className={`flex-1 py-3 rounded-xl font-bold text-[14px] transition-all ${
                  tileMode === 'spanish'
                    ? 'bg-[#FF4D01] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}>
                Spanish Tiles
              </button>
            </div>
          </div>

          {/* High Score */}
          {highScore > 0 && (
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 text-[#FFD700]">
                <Trophy className="w-5 h-5" />
                <span className="font-bold text-[16px]">High Score: {highScore}</span>
              </div>
            </div>
          )}

          {/* Play Button */}
          <button onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-[#FF4D01] to-[#FF8C00] rounded-xl text-white font-bold text-[18px] hover:brightness-110 transition-all shadow-lg">
            Play
          </button>
        </div>
      </PageLayout>
    );
  }

  // ── GAME OVER ───────────────────────────────────────────
  if (gameState === 'gameover') {
    const isSongComplete = gameOverMsg === 'Song complete!';
    return (
      <div className="min-h-screen w-full bg-[#1a1a2e] flex items-center justify-center font-inter">
        <div className="w-full max-w-[400px] mx-4 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isSongComplete ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
          }`}>
            {isSongComplete
              ? <Trophy className="w-10 h-10 text-white" />
              : <span className="text-[36px]">✗</span>
            }
          </div>

          <h2 className="text-white font-bold text-[24px] mb-2">{gameOverMsg}</h2>
          <p className="text-white/60 text-[14px] mb-6">{selectedSong.title} · {selectedSong.artist}</p>

          <div className="grid grid-cols-2 gap-3 w-full mb-8">
            <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center">
              <span className="text-white font-bold text-[28px]">{score}</span>
              <span className="text-white/50 text-[12px]">Score</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center">
              <span className="text-[#FFD700] font-bold text-[28px]">{highScore}</span>
              <span className="text-white/50 text-[12px]">High Score</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center col-span-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FF4D01]" />
                <span className="text-[#FF4D01] font-bold text-[22px]">+{earnedXp} XP</span>
              </div>
              <span className="text-white/50 text-[12px]">Earned</span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={startGame}
              className="flex-1 py-3 bg-gradient-to-r from-[#FF4D01] to-[#FF8C00] rounded-xl text-white font-bold text-[16px] hover:brightness-110 transition-all">
              Play Again
            </button>
            <button onClick={() => setGameState('menu')}
              className="flex-1 py-3 bg-white/10 rounded-xl text-white font-bold text-[16px] hover:bg-white/20 transition-all">
              Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ─────────────────────────────────────────────
  const colWidth = 100 / NUM_COLS;

  return (
    <div className="min-h-screen w-full bg-[#1a1a2e] flex flex-col items-center font-inter select-none"
      style={{ touchAction: 'manipulation' }}>

      {/* Top bar */}
      <div className="w-full max-w-[500px] flex items-center justify-between px-4 py-3">
        <button onClick={() => { cancelAnimationFrame(animRef.current); endGame('Quit'); }}
          className="text-white/60 hover:text-white text-[14px]">
          Quit
        </button>
        <div className="flex items-center gap-4">
          <span className="text-white/80 text-[14px]">{currentBeatIndex}/{selectedSong.beats.length}</span>
          <span className="text-[#FFD700] font-bold text-[18px]">{score}</span>
        </div>
      </div>

      {/* Prompt — the word to translate */}
      <div className="w-full max-w-[500px] px-4 mb-2">
        <div className="bg-white/10 rounded-xl py-3 px-6 text-center">
          <p className="text-white/50 text-[11px] mb-1">
            {tileMode === 'english' ? 'Tap the English translation' : 'Tap the Spanish translation'}
          </p>
          <p className="text-white font-bold text-[22px]">{prompt}</p>
        </div>
      </div>

      {/* Game area */}
      <div className="w-full max-w-[500px] px-4 flex-1">
        <div className="relative w-full overflow-hidden rounded-xl border border-white/10"
          style={{ height: CANVAS_H }}>
          {/* Column dividers */}
          {[1, 2, 3].map(i => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-white/5"
              style={{ left: `${colWidth * i}%` }} />
          ))}

          {/* Tiles */}
          {tiles.map(tile => (
            <button
              key={tile.id}
              onClick={() => handleTileTap(tile.id)}
              disabled={tile.tapped}
              className={`absolute transition-colors rounded-lg flex items-center justify-center text-center leading-tight ${
                tile.tapped
                  ? 'bg-[#22C55E]/30 text-white/30'
                  : tile.correct
                    ? 'bg-[#1e3a5f] hover:bg-[#264a6f] text-white border border-white/20'
                    : 'bg-[#1e3a5f] hover:bg-[#264a6f] text-white border border-white/20'
              }`}
              style={{
                left: `${tile.col * colWidth}%`,
                top: tile.y,
                width: `${colWidth}%`,
                height: TILE_HEIGHT - 4,
                padding: '4px 6px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {tile.label}
            </button>
          ))}

          {/* Bottom line — danger zone */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EF4444]/50" />
        </div>
      </div>
    </div>
  );
}
