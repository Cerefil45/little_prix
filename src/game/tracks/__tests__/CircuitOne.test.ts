import { describe, it, expect } from 'vitest';
import { CircuitOne, getTrackBoundaries } from '../CircuitOne';

describe('CircuitOne', () => {
  describe('Datos del circuito', () => {
    it('debe tener waypoints generados', () => {
      expect(CircuitOne.waypoints.length).toBeGreaterThan(0);
    });

    it('debe tener 24 waypoints (configuración estándar)', () => {
      expect(CircuitOne.waypoints.length).toBe(24);
    });

    it('debe tener posición de inicio válida', () => {
      expect(CircuitOne.startX).toBe(800);
      expect(CircuitOne.startY).toBe(180);
    });

    it('debe tener ángulo de inicio válido', () => {
      expect(CircuitOne.startAngle).toBe(0);
    });

    it('todos los waypoints deben tener ancho positivo', () => {
      for (const wp of CircuitOne.waypoints) {
        expect(wp.width).toBeGreaterThan(0);
      }
    });
  });

  describe('getTrackBoundaries', () => {
    it('debe generar segmentos inner y outer', () => {
      const boundaries = getTrackBoundaries(CircuitOne);
      
      expect(boundaries.inner.length).toBeGreaterThan(0);
      expect(boundaries.outer.length).toBeGreaterThan(0);
    });

    it('debe generar el mismo número de segmentos que waypoints', () => {
      const boundaries = getTrackBoundaries(CircuitOne);
      
      expect(boundaries.inner.length).toBe(CircuitOne.waypoints.length);
      expect(boundaries.outer.length).toBe(CircuitOne.waypoints.length);
    });

    it('los segmentos outer deben estar más lejos del centro que los inner', () => {
      const boundaries = getTrackBoundaries(CircuitOne);
      const cx = 800, cy = 600;

      // Verificar en el primer segmento
      const outerMidX = (boundaries.outer[0].x1 + boundaries.outer[0].x2) / 2;
      const outerMidY = (boundaries.outer[0].y1 + boundaries.outer[0].y2) / 2;
      const innerMidX = (boundaries.inner[0].x1 + boundaries.inner[0].x2) / 2;
      const innerMidY = (boundaries.inner[0].y1 + boundaries.inner[0].y2) / 2;

      const outerDist = Math.sqrt((outerMidX - cx) ** 2 + (outerMidY - cy) ** 2);
      const innerDist = Math.sqrt((innerMidX - cx) ** 2 + (innerMidY - cy) ** 2);

      expect(outerDist).toBeGreaterThan(innerDist);
    });

    it('los segmentos deben formar un circuito cerrado', () => {
      const boundaries = getTrackBoundaries(CircuitOne);
      
      // El final del último segmento debe estar cerca del inicio del primero
      const lastOuter = boundaries.outer[boundaries.outer.length - 1];
      const firstOuter = boundaries.outer[0];
      
      const dist = Math.sqrt(
        (lastOuter.x2 - firstOuter.x1) ** 2 + 
        (lastOuter.y2 - firstOuter.y1) ** 2
      );
      
      expect(dist).toBeLessThan(1); // Tolerancia pequeña
    });
  });
});
