/**
 * CircuitTwo - Circuito en forma de 8
 * Un circuito más desafiante con cruces y curvas cerradas
 */

import type { TrackData, Waypoint } from './CircuitOne';

/**
 * Genera waypoints para un circuito en forma de 8
 */
function generateFigure8Waypoints(
  cx: number,
  cy: number,
  radius: number,
  count: number,
  trackWidth: number
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  const halfCount = count / 2;
  
  // Primer círculo (superior)
  for (let i = 0; i < halfCount; i++) {
    const angle = (i / halfCount) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy - radius / 2 + Math.sin(angle) * radius;
    waypoints.push({ x, y, width: trackWidth });
  }
  
  // Segundo círculo (inferior)
  for (let i = 0; i < halfCount; i++) {
    const angle = (i / halfCount) * Math.PI * 2 + Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + radius / 2 + Math.sin(angle) * radius;
    waypoints.push({ x, y, width: trackWidth });
  }
  
  return waypoints;
}

export const CircuitTwo: TrackData = {
  name: 'Ocho Loca',
  totalLaps: 3,
  startX: 800,
  startY: 220,
  startAngle: 0,
  waypoints: generateFigure8Waypoints(800, 600, 350, 32, 160),
};
