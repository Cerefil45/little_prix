/**
 * RaceScreen - Pantalla completa de carrera
 * Integra canvas Phaser, HUD, controles táctiles y menús.
 */

import { useState, useRef, useCallback } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { TouchControls } from '../components/TouchControls';
import type { RaceScene } from '../../game/scenes/RaceScene';
import type { InputState } from '../../game/systems/MovementSystem';

interface RaceScreenProps {
  onBack: () => void;
}

export function RaceScreen({ onBack }: RaceScreenProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [maxSpeed] = useState(320);
  const [isDrifting, setIsDrifting] = useState(false);
  const [driftCharge, setDriftCharge] = useState(0);
  const [isOffTrack, setIsOffTrack] = useState(false);
  const [isReady, setIsReady] = useState(false);
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
  }) => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 100) return; // Actualizar cada 100ms máximo
    lastUpdateRef.current = now;
    
    setSpeed(state.speed);
    setIsDrifting(state.isDrifting);
    setDriftCharge(state.driftCharge);
    setIsOffTrack(state.isOffTrack);
  }, []);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const handlePause = () => {
    if (sceneRef.current) {
      sceneRef.current.pauseRace();
    }
    setIsPaused(true);
    // Clear inputs when pausing
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
  };

  const handleBack = () => {
    if (sceneRef.current) {
      sceneRef.current.pauseRace();
    }
    setIsPaused(false);
    onBack();
  };

  const speedPercent = Math.min(100, (speed / maxSpeed) * 100);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none" style={{ touchAction: 'none' }}>
      {/* Canvas de Phaser */}
      <GameCanvas
        onStateUpdate={handleStateUpdate}
        onReady={handleReady}
        inputRef={inputRef}
        sceneRef={sceneRef}
      />

      {/* HUD Superior */}
      {isReady && (
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

            {/* Botones de control */}
            <div className="flex gap-2 pointer-events-auto">
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

      {/* Controles táctiles */}
      <TouchControls inputRef={inputRef} disabled={isPaused} />

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
