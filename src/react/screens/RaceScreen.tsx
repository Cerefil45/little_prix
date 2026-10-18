/**
 * RaceScreen - Pantalla completa de carrera
 * Integra canvas Phaser, HUD, controles táctiles, countdown y menús.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { TouchControls } from '../components/TouchControls';
import { Countdown } from '../components/Countdown';
import { LoadingScreen } from '../components/LoadingScreen';
import { ResultsScreen } from './ResultsScreen';
import { formatTime } from '../../core/storage';
import type { RaceScene } from '../../game/scenes/RaceScene';
import type { InputState } from '../../game/systems/MovementSystem';
import type { RaceResult } from '../../core/types';

interface RaceScreenProps {
  onBack: () => void;
  vehicleId?: string;
  trackId?: string;
}

type ScreenState = 'loading' | 'countdown' | 'racing' | 'finished';

export function RaceScreen({ onBack, vehicleId = 'balanced', trackId = 'circuit1' }: RaceScreenProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [maxSpeed] = useState(320);
  const [isDrifting, setIsDrifting] = useState(false);
  const [driftCharge, setDriftCharge] = useState(0);
  const [isOffTrack, setIsOffTrack] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentLap, setCurrentLap] = useState(1);
  const [totalLaps, setTotalLaps] = useState(3);
  const [raceTime, setRaceTime] = useState(0);
  const [currentLapTime, setCurrentLapTime] = useState(0);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [raceResult, setRaceResult] = useState<RaceResult | null>(null);
  const [trackName, setTrackName] = useState('');
  const [playerPosition, setPlayerPosition] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [coinCount, setCoinCount] = useState(0);
  const [playerItem, setPlayerItem] = useState<string | null>(null);
  
  const inputRef = useRef<InputState>({
    accelerating: false,
    braking: false,
    steerLeft: false,
    steerRight: false,
    drifting: false,
  });

  const sceneRef = useRef<RaceScene | null>(null);

  // Throttle para evitar 60 re-renders por segundo
  const lastUpdateRef = useRef<number>(0);
  const handleStateUpdate = useCallback((state: {
    speed: number;
    maxSpeed: number;
    isDrifting: boolean;
    driftCharge: number;
    isOffTrack: boolean;
    position: { x: number; y: number };
    currentLap: number;
    totalLaps: number;
    lastCheckpoint: number;
    totalCheckpoints: number;
    raceTime: number;
    lapTimes: number[];
    currentLapTime: number;
    raceStarted: boolean;
    raceFinished: boolean;
    positions: Array<{ name: string; isPlayer: boolean; lap: number; progress: number }>;
    playerPosition: number;
    coinCount: number;
    playerItem: string | null;
  }) => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 100) return;
    lastUpdateRef.current = now;
    
    setSpeed(state.speed);
    setIsDrifting(state.isDrifting);
    setDriftCharge(state.driftCharge);
    setIsOffTrack(state.isOffTrack);
    setCurrentLap(state.currentLap);
    setTotalLaps(state.totalLaps);
    setRaceTime(state.raceTime);
    setCurrentLapTime(state.currentLapTime);
    setLapTimes(state.lapTimes);
    setPlayerPosition(state.playerPosition);
    setCoinCount(state.coinCount);
    setPlayerItem(state.playerItem);
  }, []);

  const handleReady = useCallback(() => {
    console.log('Scene ready, transitioning to countdown');
    setIsReady(true);
    setScreenState('countdown');
  }, []);

  const handleProgress = useCallback((progress: number) => {
    setLoadingProgress(progress);
  }, []);

  // Manejar evento de carrera terminada
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const handleRaceFinished = (data: unknown) => {
      const result = data as {
        trackName: string;
        totalTime: number;
        lapTimes: number[];
        bestLap: number;
        totalLaps: number;
        position: number;
        positions: Array<{ name: string; isPlayer: boolean; lap: number; progress: number }>;
      };
      
      console.log('[RaceScreen] Carrera terminada:', result);
      setTrackName(result.trackName);
      setPlayerPosition(result.position);
      setRaceResult({
        trackName: result.trackName,
        totalTime: result.totalTime,
        lapTimes: result.lapTimes,
        bestLap: result.bestLap,
        totalLaps: result.totalLaps,
        finishedAt: Date.now(),
        position: result.position
      });
      setScreenState('finished');
    };

    scene.onSceneEvent('raceFinished', handleRaceFinished);
    
    return () => {
      // Cleanup handled by scene shutdown
    };
  }, [isReady]);

  // Countdown completado → iniciar carrera
  const handleCountdownComplete = useCallback(() => {
    console.log('Countdown complete, sceneRef:', sceneRef.current);
    if (sceneRef.current) {
      console.log('Calling startRace()');
      sceneRef.current.startRace();
    } else {
      console.error('sceneRef.current is null!');
    }
    setScreenState('racing');
  }, []);

  const handlePause = () => {
    if (sceneRef.current) {
      sceneRef.current.pauseRace();
    }
    setIsPaused(true);
    inputRef.current = {
      accelerating: false,
      braking: false,
      steerLeft: false,
      steerRight: false,
      drifting: false,
    };
  };

  const handleResume = () => {
    if (sceneRef.current) {
      sceneRef.current.resumeRace();
    }
    setIsPaused(false);
  };

  const handleRestart = () => {
    if (sceneRef.current) {
      sceneRef.current.restartRace();
    }
    setIsPaused(false);
    setSpeed(0);
    setIsDrifting(false);
    setDriftCharge(0);
    setIsOffTrack(false);
    setCurrentLap(1);
    setRaceTime(0);
    setCurrentLapTime(0);
    setLapTimes([]);
    setScreenState('countdown');
    setRaceResult(null);
  };

  const handleBack = () => {
    if (sceneRef.current) {
      sceneRef.current.pauseRace();
    }
    setIsPaused(false);
    onBack();
  };

  // Si la carrera terminó, mostrar resultados
  if (screenState === 'finished' && raceResult) {
    return (
      <ResultsScreen
        result={raceResult}
        onRestart={handleRestart}
        onMenu={handleBack}
      />
    );
  }

  const speedPercent = Math.min(100, (speed / maxSpeed) * 100);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none" style={{ touchAction: 'none' }}>
      {/* Canvas de Phaser - SIEMPRE montado */}
      <GameCanvas
        onStateUpdate={handleStateUpdate}
        onReady={handleReady}
        onProgress={handleProgress}
        inputRef={inputRef}
        sceneRef={sceneRef}
        vehicleId={vehicleId}
        trackId={trackId}
      />

      {/* Pantalla de carga - Overlay sobre el canvas */}
      {screenState === 'loading' && (
        <LoadingScreen progress={loadingProgress} />
      )}

      {/* Countdown overlay */}
      {isReady && screenState === 'countdown' && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {/* HUD Superior */}
      {isReady && screenState === 'racing' && (
        <div className="fixed top-0 left-0 right-0 z-10 pointer-events-none">
          <div className="flex justify-between items-start p-3">
            {/* Velocímetro */}
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
              <div className="text-xs text-gray-400 mb-1">VELOCIDAD</div>
              <div className="text-xl font-bold text-white font-mono">
                {Math.round(speed)} <span className="text-xs text-gray-400">km/h</span>
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${speedPercent}%`,
                    backgroundColor: speedPercent > 80 ? '#ef4444' : speedPercent > 50 ? '#f59e0b' : '#22c55e',
                  }}
                />
              </div>
            </div>

            {/* Monedas e Item */}
            <div className="flex flex-col gap-2 items-start">
              {/* Contador de monedas */}
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <span className="text-xl font-bold text-yellow-400 font-mono">{coinCount}</span>
                </div>
              </div>

              {/* Item actual */}
              {playerItem && (
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
                  <div className="text-xs text-gray-400 mb-1">ITEM</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {playerItem === 'turbo' ? '🚀' : 
                       playerItem === 'caparazon' ? '🐢' : 
                       playerItem === 'platano' ? '🍌' :
                       playerItem === 'estrella' ? '⭐' :
                       playerItem === 'rayo' ? '⚡' :
                       playerItem === 'triple_caparazon' ? '🐢🐢🐢' : '❓'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {playerItem === 'turbo' ? 'TURBO' : 
                       playerItem === 'caparazon' ? 'CAPARAZÓN' : 
                       playerItem === 'platano' ? 'PLÁTANO' :
                       playerItem === 'estrella' ? 'ESTRELLA' :
                       playerItem === 'rayo' ? 'RAYO' :
                       playerItem === 'triple_caparazon' ? 'TRIPLE CAP.' : 'ITEM'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Presiona E o Q</div>
                </div>
              )}
            </div>

            {/* Cronómetro y Vueltas */}
            <div className="flex flex-col gap-2 items-end">
              {/* Cronómetro */}
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
                <div className="text-xs text-gray-400 mb-1">TIEMPO</div>
                <div className="text-lg font-bold text-white font-mono">
                  {formatTime(raceTime)}
                </div>
              </div>
              
              {/* Contador de Vueltas */}
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
                <div className="text-xs text-gray-400 mb-1">VUELTA</div>
                <div className="text-lg font-bold text-white font-mono">
                  {Math.min(currentLap, totalLaps)} <span className="text-xs text-gray-400">/ {totalLaps}</span>
                </div>
              </div>

              {/* Posición en carrera */}
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
                <div className="text-xs text-gray-400 mb-1">POSICIÓN</div>
                <div className={`text-2xl font-bold font-mono ${
                  playerPosition === 1 ? 'text-yellow-400' :
                  playerPosition === 2 ? 'text-gray-300' :
                  playerPosition === 3 ? 'text-orange-400' :
                  'text-gray-500'
                }`}>
                  {playerPosition}º
                </div>
              </div>

              {/* Tiempo vuelta actual */}
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 pointer-events-auto">
                <div className="text-xs text-gray-400 mb-1">VUELTA ACTUAL</div>
                <div className="text-sm font-bold text-cyan-300 font-mono">
                  {formatTime(currentLapTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de control */}
          <div className="absolute top-3 right-3 flex gap-2 pointer-events-auto mt-48">
            <button
              onClick={handlePause}
              className="w-10 h-10 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20
                flex items-center justify-center text-white text-lg
                active:bg-white/20 transition-colors"
              aria-label="Pausar"
            >
              ⏸
            </button>
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20
                flex items-center justify-center text-white text-lg
                active:bg-white/20 transition-colors"
              aria-label="Volver al menú"
            >
              ✕
            </button>
          </div>

          {/* Indicador de drift */}
          {isDrifting && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-1 text-center">
                <div className="text-xs text-yellow-400 font-bold">DRIFT</div>
                <div className="w-20 h-1.5 bg-gray-700 rounded-full mt-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-75"
                    style={{
                      width: `${driftCharge}%`,
                      backgroundColor: driftCharge > 60 ? '#f97316' : '#facc15',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Indicador off-track */}
          {isOffTrack && (
            <div className="absolute top-16 left-3">
              <div className="bg-red-900/80 rounded px-2 py-1 text-xs text-red-200 font-bold">
                ⚠ FUERA DE PISTA
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controles táctiles (solo durante la carrera) */}
      {screenState === 'racing' && (
        <TouchControls 
          inputRef={inputRef} 
          disabled={isPaused}
          hasItem={!!playerItem}
          onUseItem={() => {
            if (sceneRef.current && playerItem) {
              sceneRef.current.usePlayerItem();
            }
          }}
        />
      )}

      {/* Menú de pausa */}
      {isPaused && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mx-4 max-w-sm w-full">
            <h2 className="text-2xl font-bold text-white text-center mb-6">⏸ PAUSA</h2>
            <div className="space-y-3">
              <button
                onClick={handleResume}
                className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500
                  text-white font-bold text-lg transition-colors"
              >
                ▶ Continuar
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500
                  text-white font-bold text-lg transition-colors"
              >
                🔄 Reiniciar
              </button>
              <button
                onClick={handleBack}
                className="w-full py-3 px-4 rounded-xl bg-gray-700 hover:bg-gray-600
                  text-white font-bold text-lg transition-colors"
              >
                ✕ Salir
              </button>
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">
              Teclado: WASD / Flechas = Mover · Espacio = Drift
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
