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

  // Usar refs para los callbacks para evitar problemas de closure
  const onStateUpdateRef = useRef(onStateUpdate);
  const onReadyRef = useRef(onReady);
  const onProgressRef = useRef(onProgress);

  // Actualizar refs cuando los callbacks cambien
  useEffect(() => {
    onStateUpdateRef.current = onStateUpdate;
    onReadyRef.current = onReady;
    onProgressRef.current = onProgress;
  }, [onStateUpdate, onReady, onProgress]);

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

    console.log('GameCanvas: Starting initialization');

    // Iniciar progreso de carga
    onProgressRef.current?.(10);

    // Crear el juego
    const config = createGameConfig(containerRef.current);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    console.log('GameCanvas: Phaser game created');
    onProgressRef.current?.(30);

    // Variables para el polling
    let retryCount = 0;
    const maxRetries = 100; // Máximo 100 intentos (~10 segundos a 60fps)
    let progressInterval = 30;

    // Función para configurar la escena una vez que esté lista
    const setupScene = () => {
      retryCount++;
      
      // Verificar timeout
      if (retryCount > maxRetries) {
        console.error('GameCanvas: Timeout waiting for scene');
        return;
      }

      const scene = game.scene.getScene('RaceScene') as RaceScene;
      if (!scene) {
        // Si la escena aún no está disponible, intentar de nuevo en el próximo frame
        if (retryCount % 10 === 0) {
          console.log(`GameCanvas: Scene not ready yet, retry ${retryCount}/${maxRetries}...`);
          progressInterval = Math.min(60, progressInterval + 5);
          onProgressRef.current?.(progressInterval);
        }
        requestAnimationFrame(setupScene);
        return;
      }
      
      console.log('GameCanvas: Scene found, configuring...');
      onProgressRef.current?.(70);
      sceneRef.current = scene;

      // Registrar callbacks
      if (onStateUpdateRef.current) {
        scene.onSceneEvent('stateUpdate', onStateUpdateRef.current as SceneEventCallback);
      }
      if (onReadyRef.current) {
        scene.onSceneEvent('ready', onReadyRef.current as SceneEventCallback);
        // Llamar directamente a onReady ya que la escena ya está creada
        console.log('GameCanvas: Calling onReady callback');
        onProgressRef.current?.(100);
        onReadyRef.current();
      }

      // Iniciar sync de input
      animFrameRef.current = requestAnimationFrame(syncInput);
    };

    // Iniciar polling después de un breve delay inicial
    console.log('GameCanvas: Starting scene polling...');
    onProgressRef.current?.(40);
    setTimeout(() => {
      requestAnimationFrame(setupScene);
    }, 100);

    return () => {
      console.log('GameCanvas: Cleanup');
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
