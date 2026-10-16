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
  inputRef: React.MutableRefObject<InputState>;
  sceneRef: React.MutableRefObject<RaceScene | null>;
}

export function GameCanvas({ onStateUpdate, onReady, inputRef, sceneRef }: GameCanvasProps) {
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

    // Crear el juego
    const config = createGameConfig(containerRef.current);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Esperar a que la escena esté creada
    // Usamos scene.events 'create' que se dispara cuando la escena termina su método create()
    const setupScene = () => {
      const scene = game.scene.getScene('RaceScene') as RaceScene;
      if (!scene) return;
      
      sceneRef.current = scene;

      // Registrar callbacks
      if (onStateUpdate) {
        scene.onSceneEvent('stateUpdate', onStateUpdate as SceneEventCallback);
      }
      if (onReady) {
        scene.onSceneEvent('ready', onReady as SceneEventCallback);
      }

      // Iniciar sync de input
      animFrameRef.current = requestAnimationFrame(syncInput);
    };

    // Escuchar el evento 'create' de la escena
    game.events.on('ready', () => {
      const scene = game.scene.getScene('RaceScene') as RaceScene;
      if (scene) {
        scene.events.once('create', setupScene);
      }
    });

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
