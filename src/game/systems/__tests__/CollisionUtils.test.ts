import { describe, it, expect } from 'vitest';
import {
  closestPointOnSegment,
  distancePointToSegment,
  detectClosestCollision,
  type Segment,
} from '../CollisionUtils';

describe('CollisionUtils', () => {
  describe('closestPointOnSegment', () => {
    it('debe retornar el inicio del segmento si el punto está antes', () => {
      const closest = closestPointOnSegment(-10, 0, 0, 0, 10, 0);
      expect(closest.x).toBe(0);
      expect(closest.y).toBe(0);
    });

    it('debe retornar el final del segmento si el punto está después', () => {
      const closest = closestPointOnSegment(20, 0, 0, 0, 10, 0);
      expect(closest.x).toBe(10);
      expect(closest.y).toBe(0);
    });

    it('debe retornar el punto más cercano en el medio del segmento', () => {
      const closest = closestPointOnSegment(5, 5, 0, 0, 10, 0);
      expect(closest.x).toBe(5);
      expect(closest.y).toBe(0);
    });

    it('debe manejar segmentos verticales', () => {
      const closest = closestPointOnSegment(5, 5, 0, 0, 0, 10);
      expect(closest.x).toBe(0);
      expect(closest.y).toBe(5);
    });

    it('debe manejar segmentos diagonales', () => {
      const closest = closestPointOnSegment(5, 0, 0, 0, 10, 10);
      expect(closest.x).toBeCloseTo(5, 5);
      expect(closest.y).toBeCloseTo(5, 5);
    });

    it('debe manejar segmento de longitud cero', () => {
      const closest = closestPointOnSegment(5, 5, 0, 0, 0, 0);
      expect(closest.x).toBe(0);
      expect(closest.y).toBe(0);
    });
  });

  describe('distancePointToSegment', () => {
    it('debe calcular distancia perpendicular correcta', () => {
      const dist = distancePointToSegment(5, 5, 0, 0, 10, 0);
      expect(dist).toBe(5);
    });

    it('debe calcular distancia al inicio del segmento', () => {
      const dist = distancePointToSegment(-3, 4, 0, 0, 10, 0);
      expect(dist).toBe(5); // sqrt(9 + 16)
    });

    it('debe calcular distancia al final del segmento', () => {
      const dist = distancePointToSegment(13, 4, 0, 0, 10, 0);
      expect(dist).toBe(5); // sqrt(9 + 16)
    });

    it('debe retornar 0 si el punto está en el segmento', () => {
      const dist = distancePointToSegment(5, 0, 0, 0, 10, 0);
      expect(dist).toBe(0);
    });
  });

  describe('detectClosestCollision', () => {
    it('debe detectar colisión cuando el punto está dentro del radio', () => {
      const segments: Segment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 0 },
      ];
      
      const result = detectClosestCollision({ x: 5, y: 3 }, 5, segments);
      
      expect(result).not.toBeNull();
      expect(result!.distance).toBeLessThan(5);
    });

    it('debe retornar null si no hay colisión', () => {
      const segments: Segment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 0 },
      ];
      
      const result = detectClosestCollision({ x: 5, y: 10 }, 5, segments);
      
      expect(result).toBeNull();
    });

    it('debe encontrar la colisión más cercana entre múltiples segmentos', () => {
      const segments: Segment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 0 },  // Distancia: 3
        { x1: 0, y1: 10, x2: 10, y2: 10 }, // Distancia: 7
        { x1: 20, y1: 0, x2: 30, y2: 0 },  // Distancia: 15
      ];
      
      const result = detectClosestCollision({ x: 5, y: 3 }, 10, segments);
      
      expect(result).not.toBeNull();
      expect(result!.distance).toBe(3);
      expect(result!.segment).toBe(segments[0]);
    });

    it('debe calcular vector de empuje correcto', () => {
      const segments: Segment[] = [
        { x1: 0, y1: 0, x2: 10, y2: 0 },
      ];
      
      const result = detectClosestCollision({ x: 5, y: 3 }, 5, segments);
      
      expect(result).not.toBeNull();
      expect(result!.pushVector.x).toBeCloseTo(0, 5);
      expect(result!.pushVector.y).toBeCloseTo(1, 5); // Empuje hacia arriba
    });

    it('debe manejar múltiples segmentos cercanos', () => {
      const segments: Segment[] = [
        { x1: 0, y1: 0, x2: 5, y2: 0 },
        { x1: 5, y1: 0, x2: 10, y2: 0 },
      ];
      
      const result = detectClosestCollision({ x: 5, y: 3 }, 5, segments);
      
      expect(result).not.toBeNull();
      expect(result!.distance).toBe(3);
    });
  });
});
