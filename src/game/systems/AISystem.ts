/**
 * AISystem - Lógica de navegación para rivales IA
 * Controla el movimiento de karts no-jugador siguiendo waypoints.
 */

import type { Waypoint } from '../tracks/CircuitOne';
import type { InputState } from './MovementSystem';

export interface AIState {
  currentWaypointIndex: number;
  targetSpeed: number;
  skillLevel: number; // 0-1, donde 1 es experto
  stuckTimer: number;
  lastPosition: { x: number; y: number };
}

export interface AIConfig {
  skillLevel: number;
  maxSpeedMultiplier: number; // 0.8-1.0, qué tan rápido va respecto al máximo
  lookAheadDistance: number; // cuántos waypoints adelante mira
}

/**
 * Crea el estado inicial de la IA.
 */
export function createAIState(startWaypointIndex: number = 0): AIState {
  return {
    currentWaypointIndex: startWaypointIndex,
    targetSpeed: 0,
    skillLevel: 0.7,
    stuckTimer: 0,
    lastPosition: { x: 0, y: 0 },
  };
}

/**
 * Calcula el input que la IA debe aplicar para seguir los waypoints.
 */
export function calculateAIInput(
  aiState: AIState,
  position: { x: number; y: number },
  angle: number,
  speed: number,
  waypoints: Waypoint[],
  config: AIConfig
): InputState {
  const input: InputState = {
    accelerating: false,
    braking: false,
    steerLeft: false,
    steerRight: false,
    drifting: false,
  };

  // Determinar waypoint objetivo - mirar más adelante para mejor navegación
  const lookAhead = Math.max(2, config.lookAheadDistance);
  const targetIndex = (aiState.currentWaypointIndex + lookAhead) % waypoints.length;
  const target = waypoints[targetIndex];

  // Calcular ángulo hacia el objetivo
  const dx = target.x - position.x;
  const dy = target.y - position.y;
  const targetAngle = Math.atan2(dy, dx);

  // Calcular diferencia de ángulo
  let angleDiff = targetAngle - angle;
  
  // Normalizar a [-PI, PI]
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  // Decidir dirección de giro - umbral más bajo para giros más precisos
  const turnThreshold = 0.05; // Radianes
  if (angleDiff > turnThreshold) {
    input.steerRight = true;
  } else if (angleDiff < -turnThreshold) {
    input.steerLeft = true;
  }

  // Decelerar en curvas cerradas - mejor manejo de curvas
  const absAngleDiff = Math.abs(angleDiff);
  const isSharpTurn = absAngleDiff > 0.4;
  const isMediumTurn = absAngleDiff > 0.2;
  const targetMaxSpeed = config.maxSpeedMultiplier * 320; // PHYSICS.MAX_SPEED
  
  if (isSharpTurn) {
    // Curva cerrada: frenar significativamente
    if (speed > targetMaxSpeed * 0.5) {
      input.accelerating = false;
      input.braking = speed > targetMaxSpeed * 0.6;
    } else {
      input.accelerating = true;
    }
  } else if (isMediumTurn) {
    // Curva media: mantener velocidad moderada
    input.accelerating = speed < targetMaxSpeed * 0.8;
    input.braking = false;
  } else {
    // Recta o curva suave: acelerar al máximo
    input.accelerating = speed < targetMaxSpeed;
    input.braking = false;
  }

  // Derrapar en curvas cerradas a alta velocidad (solo IAs expertas)
  if (config.skillLevel > 0.7 && isSharpTurn && speed > targetMaxSpeed * 0.6) {
    input.drifting = true;
  }

  // Detectar si está atascado
  const moved = Math.abs(position.x - aiState.lastPosition.x) + 
                Math.abs(position.y - aiState.lastPosition.y);
  
  if (moved < 1) {
    aiState.stuckTimer++;
    if (aiState.stuckTimer > 60) { // 1 segundo a 60fps
      // Está atascado, intentar maniobra de escape
      input.accelerating = true;
      input.braking = false;
      // Alternar dirección de giro para desatascar
      if (Math.random() > 0.5) {
        input.steerLeft = true;
        input.steerRight = false;
      } else {
        input.steerRight = true;
        input.steerLeft = false;
      }
      aiState.stuckTimer = 0;
    }
  } else {
    aiState.stuckTimer = 0;
  }

  // Actualizar última posición
  aiState.lastPosition = { x: position.x, y: position.y };

  return input;
}

/**
 * Actualiza el índice del waypoint actual basado en la posición.
 */
export function updateWaypointIndex(
  aiState: AIState,
  position: { x: number; y: number },
  waypoints: Waypoint[]
): void {
  const currentWaypoint = waypoints[aiState.currentWaypointIndex];
  const dx = position.x - currentWaypoint.x;
  const dy = position.y - currentWaypoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Si está cerca del waypoint actual, avanzar al siguiente
  if (distance < 80) {
    aiState.currentWaypointIndex = (aiState.currentWaypointIndex + 1) % waypoints.length;
  }
}
