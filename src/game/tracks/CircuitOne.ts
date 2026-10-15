/**
 * CircuitOne - Datos del circuito ovalado
 * Define los waypoints que forman el circuito y sus límites.
 */

export interface Waypoint {
  x: number;
  y: number;
  width: number; // Ancho de pista en este punto
}

export interface TrackData {
  name: string;
  waypoints: Waypoint[];
  startX: number;
  startY: number;
  startAngle: number;
  totalLaps: number;
}

/**
 * Circuito ovalado simple.
 * El mundo es de 1600x1200. El óvalo tiene centro en (800, 600).
 * Los waypoints siguen el perímetro del óvalo en sentido horario.
 */
export const CircuitOne: TrackData = {
  name: 'Circuito Inicial',
  totalLaps: 3,
  startX: 800,
  startY: 180,
  startAngle: 0, // Mirando a la derecha (sentido horario)
  waypoints: generateOvalWaypoints(800, 600, 550, 380, 24, 120),
};

/**
 * Genera waypoints distribuidos uniformemente en un óvalo.
 */
function generateOvalWaypoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  trackWidth: number
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // Empieza arriba
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    waypoints.push({ x, y, width: trackWidth });
  }
  return waypoints;
}

/**
 * Genera los polígonos de colisión para los bordes del circuito.
 * Retorna segmentos de línea (inner y outer) que forman los límites.
 */
export function getTrackBoundaries(track: TrackData): {
  inner: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  outer: Array<{ x1: number; y1: number; x2: number; y2: number }>;
} {
  const inner: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const outer: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const wp = track.waypoints;
  const count = wp.length;

  for (let i = 0; i < count; i++) {
    const curr = wp[i];
    const next = wp[(i + 1) % count];

    // Dirección del segmento
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) continue;

    // Normal perpendicular (hacia la derecha del sentido de marcha)
    const nx = -dy / len;
    const ny = dx / len;

    const halfWidth = curr.width / 2;

    // Para simplificar, usamos el ancho del waypoint actual
    // Puntos inner y outer del segmento actual
    const currInnerX = curr.x + nx * halfWidth;
    const currInnerY = curr.y + ny * halfWidth;
    const currOuterX = curr.x - nx * halfWidth;
    const currOuterY = curr.y - ny * halfWidth;

    // Siguiente waypoint
    const nextDx = wp[(i + 2) % count].x - next.x;
    const nextDy = wp[(i + 2) % count].y - next.y;
    const nextLen = Math.sqrt(nextDx * nextDx + nextDy * nextDy) || 1;
    const nextNx = -nextDy / nextLen;
    const nextNy = nextDx / nextLen;
    const nextHalfWidth = next.width / 2;

    const nextInnerX = next.x + nextNx * nextHalfWidth;
    const nextInnerY = next.y + nextNy * nextHalfWidth;
    const nextOuterX = next.x - nextNx * nextHalfWidth;
    const nextOuterY = next.y - nextNy * nextHalfWidth;

    inner.push({ x1: currInnerX, y1: currInnerY, x2: nextInnerX, y2: nextInnerY });
    outer.push({ x1: currOuterX, y1: currOuterY, x2: nextOuterX, y2: nextOuterY });
  }

  return { inner, outer };
}
