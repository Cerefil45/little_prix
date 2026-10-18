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
  
  // Sistema de checkpoints para IA
  public currentLap: number = 1;
  public lastCheckpoint: number = -1;
  public checkpoints: Array<{ x: number; y: number; radius: number }> = [];

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
   * Ahora acepta información de progreso para rubber banding.
   */
  updateAI(dt: number, playerProgress?: number, aiProgress?: number): void {
    if (this.finished) return;

    // Actualizar índice de waypoint
    updateWaypointIndex(this.aiState, this.getPosition(), this.waypoints);

    // Verificar checkpoints
    this.checkCheckpoints();

    // Calcular input de IA con rubber banding
    const input = calculateAIInput(
      this.aiState,
      this.getPosition(),
      this.physics.angle,
      this.physics.speed,
      this.waypoints,
      this.aiConfig,
      playerProgress,
      aiProgress
    );

    // Actualizar física con el input de IA
    this.update(dt, input);
  }

  /**
   * Verifica si el kart de IA ha cruzado algún checkpoint.
   */
  checkCheckpoints(): void {
    if (this.checkpoints.length === 0) {
      console.log(`[IA ${this.name}] ERROR: No hay checkpoints asignados`);
      return;
    }

    const kartPos = this.getPosition();
    
    // Buscar el checkpoint más cercano
    let closestCheckpointIndex = -1;
    let closestDistance = Infinity;
    
    for (let i = 0; i < this.checkpoints.length; i++) {
      const checkpoint = this.checkpoints[i];
      const dx = kartPos.x - checkpoint.x;
      const dy = kartPos.y - checkpoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestCheckpointIndex = i;
      }
    }
    
    // Debug: Log cada 60 frames (1 segundo) para ver la distancia al checkpoint más cercano
    if (this.aiState.stuckTimer % 60 === 0) {
      const checkpoint = this.checkpoints[closestCheckpointIndex];
      console.log(`[IA ${this.name}] Checkpoint más cercano: ${closestCheckpointIndex}, distancia: ${closestDistance.toFixed(2)}, radio: ${checkpoint.radius}, dentro: ${closestDistance < checkpoint.radius}`);
    }
    
    // Si está dentro de algún checkpoint
    if (closestDistance < this.checkpoints[closestCheckpointIndex].radius) {
      // Verificar que sea el siguiente checkpoint en la secuencia
      const expectedNext = (this.lastCheckpoint + 1) % this.checkpoints.length;
      
      console.log(`[IA ${this.name}] En checkpoint ${closestCheckpointIndex}. Esperado: ${expectedNext}. LastCheckpoint: ${this.lastCheckpoint}`);
      
      if (closestCheckpointIndex === expectedNext) {
        // Verificar si completó vuelta ANTES de actualizar lastCheckpoint
        const completedLap = (closestCheckpointIndex === 0 && this.lastCheckpoint === this.checkpoints.length - 1);
        
        this.lastCheckpoint = closestCheckpointIndex;
        
        console.log(`[IA ${this.name}] ✓ Checkpoint ${closestCheckpointIndex} aceptado. CompletedLap: ${completedLap}`);

        // Si completó todos los checkpoints, completar vuelta
        if (completedLap) {
          this.currentLap++;
          console.log(`[IA ${this.name}] ¡Vuelta completada! Nueva vuelta: ${this.currentLap}`);
        }
      }
    }
  }

  /**
   * Obtiene el índice del waypoint actual.
   */
  getProgress(): number {
    return this.aiState.currentWaypointIndex;
  }

  /**
   * Marca al kart como terminado.
   */
  markFinished(time: number): void {
    this.finished = true;
    this.finishTime = time;
  }
}
