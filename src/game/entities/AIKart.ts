/**
 * AIKart - Entidad de kart controlado por IA
 * Extiende la lógica de Kart con comportamiento autónomo.
 */

import Phaser from 'phaser';
import { Kart } from './Kart';
import type { Waypoint } from '../tracks/CircuitOne';
import {
  type AIState,
  type AIConfig,
  createAIState,
  calculateAIInput,
  updateWaypointIndex,
} from '../systems/AISystem';
import type { InputState } from '../systems/MovementSystem';

export class AIKart extends Kart {
  public aiState: AIState;
  public aiConfig: AIConfig;
  public name: string;
  public finished: boolean = false;
  public finishTime: number = 0;

  private waypoints: Waypoint[];
  private bodyColor: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    angle: number,
    waypoints: Waypoint[],
    config: AIConfig,
    name: string,
    bodyColor: number
  ) {
    super(scene, x, y, angle);
    
    this.waypoints = waypoints;
    this.aiConfig = config;
    this.name = name;
    this.bodyColor = bodyColor;
    this.aiState = createAIState(0);
    this.aiState.skillLevel = config.skillLevel;

    // Redibujar con color diferente
    this.drawAIColor();
  }

  /**
   * Dibuja el kart con color personalizado para diferenciarlo del jugador.
   */
  private drawAIColor(): void {
    this.sprite.clear();

    // Sombra
    this.sprite.fillStyle(0x000000, 0.3);
    this.sprite.fillRoundedRect(-16, -10, 32, 22, 4);

    // Cuerpo principal (color de IA)
    this.sprite.fillStyle(this.bodyColor, 1);
    this.sprite.fillRoundedRect(-15, -12, 30, 24, 4);

    // Cabina
    this.sprite.fillStyle(0x1d3557, 1);
    this.sprite.fillRoundedRect(-6, -8, 14, 16, 3);

    // Alerón delantero
    this.sprite.fillStyle(0xf1faee, 1);
    this.sprite.fillRect(12, -14, 4, 28);

    // Ruedas
    this.sprite.fillStyle(0x333333, 1);
    this.sprite.fillRect(-14, -16, 8, 4);
    this.sprite.fillRect(-14, 12, 8, 4);
    this.sprite.fillRect(6, -16, 8, 4);
    this.sprite.fillRect(6, 12, 8, 4);

    // Número
    this.sprite.fillStyle(0xffffff, 1);
    this.sprite.fillCircle(0, 0, 5);
    this.sprite.fillStyle(this.bodyColor, 1);
    this.sprite.fillRect(-2, -3, 4, 6);

    // Rotar según el ángulo
    this.sprite.setRotation(this.physics.angle);
  }

  /**
   * Actualiza el kart de IA cada frame.
   */
  updateAI(dt: number): void {
    if (this.finished) return;

    // Actualizar índice de waypoint
    updateWaypointIndex(this.aiState, this.getPosition(), this.waypoints);

    // Calcular input de IA
    const input = calculateAIInput(
      this.aiState,
      this.getPosition(),
      this.physics.angle,
      this.physics.speed,
      this.waypoints,
      this.aiConfig
    );

    // Actualizar física con el input de IA
    this.update(dt, input);
  }

  /**
   * Marca al kart como terminado.
   */
  markFinished(time: number): void {
    this.finished = true;
    this.finishTime = time;
  }

  /**
   * Obtiene el progreso de la carrera (para calcular posiciones).
   */
  getProgress(): number {
    return this.aiState.currentWaypointIndex;
  }
}
