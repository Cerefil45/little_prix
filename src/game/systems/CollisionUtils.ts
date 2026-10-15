/**
 * CollisionUtils - Utilidades de detección de colisiones
 * Lógica determinista separada de Phaser para facilitar testing.
 */

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Encuentra el punto más cercano en un segmento a un punto dado.
 */
export function closestPointOnSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Point {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return { x: x1, y: y1 };

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  return {
    x: x1 + t * dx,
    y: y1 + t * dy,
  };
}

/**
 * Calcula la distancia más corta de un punto a un segmento de línea.
 */
export function distancePointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const closest = closestPointOnSegment(px, py, x1, y1, x2, y2);
  const dx = px - closest.x;
  const dy = py - closest.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Detecta la colisión más cercana entre un punto (con radio) y un conjunto de segmentos.
 * Retorna información sobre la colisión o null si no hay colisión.
 */
export function detectClosestCollision(
  point: Point,
  radius: number,
  segments: Segment[]
): { segment: Segment; closestPoint: Point; distance: number; pushVector: Point } | null {
  let closestCollision: {
    segment: Segment;
    closestPoint: Point;
    distance: number;
    pushVector: Point;
  } | null = null;

  for (const seg of segments) {
    const dist = distancePointToSegment(point.x, point.y, seg.x1, seg.y1, seg.x2, seg.y2);
    
    if (dist < radius) {
      const closest = closestPointOnSegment(point.x, point.y, seg.x1, seg.y1, seg.x2, seg.y2);
      const pushX = point.x - closest.x;
      const pushY = point.y - closest.y;
      const pushLen = Math.sqrt(pushX * pushX + pushY * pushY);
      
      const pushVector = pushLen > 0
        ? { x: pushX / pushLen, y: pushY / pushLen }
        : { x: 0, y: 0 };

      if (!closestCollision || dist < closestCollision.distance) {
        closestCollision = {
          segment: seg,
          closestPoint: closest,
          distance: dist,
          pushVector,
        };
      }
    }
  }

  return closestCollision;
}
