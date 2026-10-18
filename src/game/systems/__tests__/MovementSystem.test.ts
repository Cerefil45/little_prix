import { describe, it, expect, beforeEach } from 'vitest';
import {
  updateMovement,
  createKartPhysics,
  getVelocityVector,
  PHYSICS,
  type InputState,
  type KartPhysics,
} from '../MovementSystem';

describe('MovementSystem', () => {
  let physics: KartPhysics;
  let input: InputState;

  beforeEach(() => {
    physics = createKartPhysics();
    input = {
      accelerating: false,
      braking: false,
      steerLeft: false,
      steerRight: false,
      drifting: false,
    };
  });

  describe('Aceleración', () => {
    it('debe acelerar cuando se presiona el acelerador', () => {
      input.accelerating = true;
      const initialSpeed = physics.speed;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.speed).toBeGreaterThan(initialSpeed);
    });

    it('no debe exceder la velocidad máxima', () => {
      input.accelerating = true;
      
      // Simular múltiples frames
      for (let i = 0; i < 100; i++) {
        updateMovement(physics, input, 0.016, false);
      }
      
      expect(physics.speed).toBeLessThanOrEqual(PHYSICS.MAX_SPEED);
    });

    it('debe aplicar fricción cuando no se acelera', () => {
      physics.speed = 100;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.speed).toBeLessThan(100);
    });

    it('debe detenerse cuando la velocidad es muy baja', () => {
      physics.speed = 1;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.speed).toBe(0);
    });
  });

  describe('Frenado', () => {
    it('debe frenar cuando se presiona el freno', () => {
      physics.speed = 100;
      input.braking = true;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.speed).toBeLessThan(100);
    });

    it('debe permitir marcha atrás', () => {
      input.braking = true;
      
      // Simular múltiples frames
      for (let i = 0; i < 50; i++) {
        updateMovement(physics, input, 0.016, false);
      }
      
      expect(physics.speed).toBeLessThan(0);
    });

    it('no debe exceder la velocidad máxima en reversa', () => {
      input.braking = true;
      
      // Simular múltiples frames
      for (let i = 0; i < 200; i++) {
        updateMovement(physics, input, 0.016, false);
      }
      
      expect(physics.speed).toBeGreaterThanOrEqual(-PHYSICS.MAX_SPEED * 0.3);
    });
  });

  describe('Giros', () => {
    it('debe girar a la izquierda', () => {
      physics.speed = 100;
      input.steerLeft = true;
      const initialAngle = physics.angle;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.angle).toBeLessThan(initialAngle);
    });

    it('debe girar a la derecha', () => {
      physics.speed = 100;
      input.steerRight = true;
      const initialAngle = physics.angle;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.angle).toBeGreaterThan(initialAngle);
    });

    it('no debe girar cuando está detenido', () => {
      physics.speed = 0;
      input.steerLeft = true;
      const initialAngle = physics.angle;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.angle).toBe(initialAngle);
    });

    it('debe girar más rápido a mayor velocidad', () => {
      physics.speed = 50;
      input.steerLeft = true;
      const angleAt50 = physics.angle;
      
      updateMovement(physics, input, 0.1, false);
      const turnAt50 = Math.abs(physics.angle - angleAt50);
      
      physics.speed = 200;
      physics.angle = 0;
      const angleAt200 = physics.angle;
      
      updateMovement(physics, input, 0.1, false);
      const turnAt200 = Math.abs(physics.angle - angleAt200);
      
      expect(turnAt200).toBeGreaterThan(turnAt50);
    });
  });

  describe('Derrape (Drift)', () => {
    it('debe iniciar derrape cuando se presiona drift y se gira', () => {
      physics.speed = 100;
      input.steerLeft = true;
      input.drifting = true;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.isDrifting).toBe(true);
    });

    it('no debe iniciar derrape a baja velocidad', () => {
      physics.speed = 50;
      input.steerLeft = true;
      input.drifting = true;
      
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.isDrifting).toBe(false);
    });

    it('debe cargar el drift con el tiempo', () => {
      physics.speed = 100;
      input.steerLeft = true;
      input.drifting = true;
      
      updateMovement(physics, input, 0.5, false);
      
      expect(physics.driftCharge).toBeGreaterThan(0);
    });

    it('no debe exceder 100% de carga de drift', () => {
      physics.speed = 100;
      input.steerLeft = true;
      input.drifting = true;
      
      updateMovement(physics, input, 10, false);
      
      expect(physics.driftCharge).toBeLessThanOrEqual(100);
    });

    it('debe aplicar mini-turbo al soltar drift', () => {
      physics.speed = 100;
      physics.isDrifting = true;
      physics.driftCharge = 80;
      input.steerLeft = false;
      input.drifting = false;
      
      const speedBefore = physics.speed;
      updateMovement(physics, input, 0.1, false);
      
      expect(physics.speed).toBeGreaterThan(speedBefore);
      expect(physics.isDrifting).toBe(false);
      expect(physics.driftCharge).toBe(0);
    });
  });

  describe('Fuera de pista', () => {
    it('debe reducir velocidad máxima fuera de pista', () => {
      input.accelerating = true;
      
      // Simular múltiples frames fuera de pista
      for (let i = 0; i < 100; i++) {
        updateMovement(physics, input, 0.016, true);
      }
      
      expect(physics.speed).toBeLessThanOrEqual(PHYSICS.OFF_TRACK_MAX_SPEED);
    });

    it('debe aplicar más fricción fuera de pista', () => {
      physics.speed = 100;
      
      updateMovement(physics, input, 0.1, true);
      const speedOffTrack = physics.speed;
      
      physics.speed = 100;
      updateMovement(physics, input, 0.1, false);
      const speedOnTrack = physics.speed;
      
      expect(speedOffTrack).toBeLessThan(speedOnTrack);
    });
  });

  describe('getVelocityVector', () => {
    it('debe calcular vector de velocidad correcto', () => {
      physics.speed = 100;
      physics.angle = 0; // Mirando a la derecha
      
      const vel = getVelocityVector(physics);
      
      expect(vel.vx).toBeCloseTo(100, 5);
      expect(vel.vy).toBeCloseTo(0, 5);
    });

    it('debe calcular vector con ángulo de 90 grados', () => {
      physics.speed = 100;
      physics.angle = Math.PI / 2; // Mirando hacia abajo
      
      const vel = getVelocityVector(physics);
      
      expect(vel.vx).toBeCloseTo(0, 5);
      expect(vel.vy).toBeCloseTo(100, 5);
    });
  });
});
