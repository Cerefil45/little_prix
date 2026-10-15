/**
 * MovementSystem - Física arcade para el kart
 * Maneja aceleración, giro, fricción y derrape.
 */

import Phaser from 'phaser';

export interface InputState {
  accelerating: boolean;
  braking: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  drifting: boolean;
}

export interface KartPhysics {
  speed: number;
  maxSpeed: number;
  acceleration: number;
  brakeForce: number;
  friction: number;
  turnRate: number;
  angle: number;
  isDrifting: boolean;
  driftDirection: number; // -1, 0, 1
  driftCharge: number;
}

// Constantes de física
export const PHYSICS = {
  MAX_SPEED: 320,
  ACCELERATION: 280,
  BRAKE_FORCE: 400,
  FRICTION: 2.5,
  TURN_RATE: 3.2,
  DRIFT_CHARGE_RATE: 40,
  DRIFT_SLIDE_ANGLE: 0.35,
  DRIFT_TURN_BONUS: 1.4,
  MINI_TURBO_BOOST: 80,
  OFF_TRACK_FRICTION: 6.0,
  OFF_TRACK_MAX_SPEED: 120,
  COLLISION_SPEED_LOSS: 0.6,
};

/**
 * Actualiza la física del kart según el input y el delta time.
 */
export function updateMovement(
  physics: KartPhysics,
  input: InputState,
  dt: number,
  isOffTrack: boolean
): void {
  const maxSpd = isOffTrack ? PHYSICS.OFF_TRACK_MAX_SPEED : physics.maxSpeed;
  const friction = isOffTrack ? PHYSICS.OFF_TRACK_FRICTION : PHYSICS.FRICTION;

  // 1. Aceleración / frenado
  if (input.accelerating) {
    physics.speed += physics.acceleration * dt;
  } else if (input.braking) {
    physics.speed -= physics.brakeForce * dt;
  } else {
    // Fricción natural
    physics.speed -= physics.speed * friction * dt;
  }

  // Clamp velocidad
  physics.speed = Phaser.Math.Clamp(physics.speed, -maxSpd * 0.3, maxSpd);

  // Si la velocidad es muy baja, detener
  if (Math.abs(physics.speed) < 2 && !input.accelerating && !input.braking) {
    physics.speed = 0;
  }

  // 2. Giro (proporcional a la velocidad)
  const speedRatio = Math.abs(physics.speed) / physics.maxSpeed;
  const turnMultiplier = Phaser.Math.Clamp(speedRatio * 1.5, 0.3, 1.0);
  let effectiveTurnRate = physics.turnRate * turnMultiplier * dt;

  // Dirección del giro
  let steerDir = 0;
  if (input.steerLeft) steerDir = -1;
  if (input.steerRight) steerDir = 1;

  // 3. Derrape
  if (input.drifting && Math.abs(steerDir) > 0 && Math.abs(physics.speed) > 80) {
    if (!physics.isDrifting) {
      physics.isDrifting = true;
      physics.driftDirection = steerDir;
      physics.driftCharge = 0;
    }
    // Cargar drift
    physics.driftCharge = Math.min(100, physics.driftCharge + PHYSICS.DRIFT_CHARGE_RATE * dt);
    // Giro amplificado durante drift
    effectiveTurnRate *= PHYSICS.DRIFT_TURN_BONUS;
  } else if (physics.isDrifting) {
    // Soltar drift → mini-turbo
    const boostLevel = physics.driftCharge >= 80 ? 3 : physics.driftCharge >= 40 ? 2 : 1;
    physics.speed = Math.min(maxSpd * 1.3, physics.speed + boostLevel * PHYSICS.MINI_TURBO_BOOST * 0.4);
    physics.isDrifting = false;
    physics.driftDirection = 0;
    physics.driftCharge = 0;
  }

  // Aplicar giro al ángulo
  if (physics.speed !== 0) {
    const direction = physics.speed >= 0 ? 1 : -1;
    physics.angle += steerDir * effectiveTurnRate * direction;
  }
}

/**
 * Calcula el desplazamiento del kart basado en su ángulo y velocidad.
 */
export function getVelocityVector(physics: KartPhysics): { vx: number; vy: number } {
  return {
    vx: Math.cos(physics.angle) * physics.speed,
    vy: Math.sin(physics.angle) * physics.speed,
  };
}

/**
 * Crea un estado de física inicial.
 */
export function createKartPhysics(maxSpeed: number = PHYSICS.MAX_SPEED): KartPhysics {
  return {
    speed: 0,
    maxSpeed,
    acceleration: PHYSICS.ACCELERATION,
    brakeForce: PHYSICS.BRAKE_FORCE,
    friction: PHYSICS.FRICTION,
    turnRate: PHYSICS.TURN_RATE,
    angle: 0,
    isDrifting: false,
    driftDirection: 0,
    driftCharge: 0,
  };
}
