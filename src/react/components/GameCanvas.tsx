/**
 * GameCanvas - Contenedor React para el canvas de Phaser
 * Gestiona el ciclo de vida del juego y la comunicación con la escena.
 */

import { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../../game/config';
import { RaceScene, type SceneEventCallback } from '../../game/scenes/RaceScene';
import type { InputState } from '../../game/systems/MovementSystem';

interface GameCanvasProps {
  onStateUpdate?: (state: {
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
  }) => void;
  onReady?: () => void;
  onProgress?: (progress: number) => void;
  inputRef: React.MutableRefObject<InputState>;
  sceneRef: React.MutableRefObject<RaceScene | null>;
}

export function GameCanvas({ onStateUpdate, onReady, onProgress, inputRef, sceneRef }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const animFrameRef = useRef<number>(0);

  // Sincronizar input táctil con la escena
  // Solo actualizamos cuando el input ha cambiado para evitar llamadas innecesarias
  const lastInputRef = useRef<string>('');
  const syncInput = useCallback(() => {
    if (sceneRef.current) {
      const inputStr = JSON.stringify(inputRef.current);
      if (inputStr !== lastInputRef.current) {
        lastInputRef.current = inputStr;
        sceneRef.current.setTouchInput(inputRef.current);
      }
    }
    animFrameRef.current = requestAnimationFrame(syncInput);
  }, [inputRef, sceneRef]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Iniciar progreso de carga
    onProgress?.(10);

    // Crear el juego
    const config = createGameConfig(containerRef.current);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    onProgress?.(30);

    // Función para configurar la escena una vez que esté lista
    const setupScene = () => {
      const scene = game.scene.getScene('RaceScene') as RaceScene;
      if (!scene) {
        // Si la escena aún no está disponible, intentar de nuevo en el próximo frame
        console.log('Scene not ready yet, retrying...');
        onProgress?.(40);
        requestAnimationFrame(setupScene);
        return;
      }
      
      onProgress?.(70);
      console.log('Scene ready, setting sceneRef');
      sceneRef.current = scene;

      // Registrar callbacks
      if (onStateUpdate) {
        scene.onSceneEvent('stateUpdate', onStateUpdate as SceneEventCallback);
      }
      if (onReady) {
        scene.onSceneEvent('ready', onReady as SceneEventCallback);
        // Llamar directamente a onReady ya que la escena ya está creada
        console.log('Calling onReady callback directly');
        onProgress?.(100);
        onReady();
      }

      // Iniciar sync de input
      animFrameRef.current = requestAnimationFrame(syncInput);
    };

    // Intentar configurar la escena después de un breve delay para asegurar que Phaser se inicialice
    onProgress?.(50);
    setTimeout(setupScene, 100);

    return () => {
      // Limpiar
      cancelAnimationFrame(animFrameRef.current);
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('RaceScene') as RaceScene;
        if (scene) scene.shutdown();
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0"
      style={{ touchAction: 'none' }}
    />
  );
}
