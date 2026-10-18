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

export type AIPersonality = 'aggressive' | 'technical' | 'beginner';

export interface AIConfig {
  skillLevel: number;
  maxSpeedMultiplier: number; // 0.8-1.0, qué tan rápido va respecto al máximo
  lookAheadDistance: number; // cuántos waypoints adelante mira
  rubberBandStrength?: number; // 0.0-0.2, fuerza del rubber banding
  personality?: AIPersonality; // tipo de personalidad de la IA
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
 * Ahora incluye rubber banding para mantener carreras competitivas.
 */
export function calculateAIInput(
  aiState: AIState,
  position: { x: number; y: number },
  angle: number,
  speed: number,
  waypoints: Waypoint[],
  config: AIConfig,
  playerProgress?: number,
  aiProgress?: number
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
  
  // Aplicar rubber banding si está disponible
  let rubberBandBoost = 1.0;
  if (config.rubberBandStrength && playerProgress !== undefined && aiProgress !== undefined) {
    const positionDiff = playerProgress - aiProgress;
    // Solo aplicar boost si la IA está atrás del jugador
    if (positionDiff > 0) {
      rubberBandBoost = 1 + (positionDiff * config.rubberBandStrength);
      rubberBandBoost = Math.min(rubberBandBoost, 1.2); // Máximo +20%
    }
  }
  
  const targetMaxSpeed = config.maxSpeedMultiplier * 320 * rubberBandBoost; // PHYSICS.MAX_SPEED
  
  // Comportamiento según personalidad
  const personality = config.personality || 'technical';
  
  if (personality === 'aggressive') {
    // IA agresiva: frena menos, toma más riesgos
    if (isSharpTurn) {
      input.accelerating = speed < targetMaxSpeed * 0.7;
      input.braking = speed > targetMaxSpeed * 0.85;
    } else if (isMediumTurn) {
      input.accelerating = speed < targetMaxSpeed * 0.95;
      input.braking = false;
    } else {
      input.accelerating = speed < targetMaxSpeed;
      input.braking = false;
    }
    // Más propenso a drift
    input.drifting = isSharpTurn && speed > targetMaxSpeed * 0.6;
  } else if (personality === 'beginner') {
    // IA principiante: frena más, es más cautelosa
    if (isSharpTurn) {
      input.accelerating = speed < targetMaxSpeed * 0.4;
      input.braking = speed > targetMaxSpeed * 0.5;
    } else if (isMediumTurn) {
      input.accelerating = speed < targetMaxSpeed * 0.65;
      input.braking = speed > targetMaxSpeed * 0.7;
    } else {
      input.accelerating = speed < targetMaxSpeed * 0.85;
      input.braking = false;
    }
    // Menos propenso a drift
    input.drifting = false;
  } else {
    // IA técnica: comportamiento balanceado (el original)
    if (isSharpTurn) {
      if (speed > targetMaxSpeed * 0.5) {
        input.accelerating = false;
        input.braking = speed > targetMaxSpeed * 0.6;
      } else {
        input.accelerating = true;
      }
    } else if (isMediumTurn) {
      input.accelerating = speed < targetMaxSpeed * 0.8;
      input.braking = false;
    } else {
      input.accelerating = speed < targetMaxSpeed;
      input.braking = false;
    }
    // Drift inteligente
    input.drifting = isSharpTurn && speed > targetMaxSpeed * 0.65 && config.skillLevel > 0.7;
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
  const nextWaypoint = waypoints[(aiState.currentWaypointIndex + 1) % waypoints.length];
  
  // Calcular distancia al waypoint actual
  const dxCurrent = position.x - currentWaypoint.x;
  const dyCurrent = position.y - currentWaypoint.y;
  const distanceCurrent = Math.sqrt(dxCurrent * dxCurrent + dyCurrent * dyCurrent);
  
  // Calcular distancia al siguiente waypoint
  const dxNext = position.x - nextWaypoint.x;
  const dyNext = position.y - nextWaypoint.y;
  const distanceNext = Math.sqrt(dxNext * dxNext + dyNext * dyNext);
  
  // Avanzar al siguiente waypoint si:
  // 1. Está muy cerca del actual (< 60px), O
  // 2. Está más cerca del siguiente que del actual
  if (distanceCurrent < 60 || distanceNext < distanceCurrent) {
    aiState.currentWaypointIndex = (aiState.currentWaypointIndex + 1) % waypoints.length;
  }
}
