/**
 * Phaser Game Configuration
 * Configuración del motor de juego para Little Grand Prix.
 */

import Phaser from 'phaser';
import { RaceScene } from './scenes/RaceScene';

/**
 * Crea la configuración de Phaser para el juego.
 */
export function createGameConfig(
  parent: string | HTMLElement, 
  vehicleId: string = 'balanced',
  trackId: string = 'circuit1'
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 1600,
    height: 1200,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [RaceScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    render: {
      pixelArt: false,
      antialias: true,
      roundPixels: true,
    },
    input: {
      activePointers: 3, // Soporte multi-touch
    },
    audio: {
      noAudio: true, // Sin audio en esta iteración
    },
    callbacks: {
      postBoot: (game) => {
        // Pasar datos a la escena después de que el juego se inicialice
        const scene = game.scene.getScene('RaceScene') as RaceScene;
        if (scene) {
          scene.init({ vehicleId, trackId });
        }
      }
    }
  };
}
