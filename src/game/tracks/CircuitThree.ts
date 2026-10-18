/**
 * CircuitThree - Circuito con chicanas
 * Un circuito técnico con curvas en zigzag y rectas largas
 */

import type { TrackData, Waypoint } from './CircuitOne';

/**
 * Genera waypoints para un circuito con chicanas
 */
function generateChicaneWaypoints(
  cx: number,
  cy: number,
  width: number,
  height: number,
  trackWidth: number
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  
  // Recta superior
  waypoints.push({ x: cx - width / 2, y: cy - height / 2, width: trackWidth });
  waypoints.push({ x: cx, y: cy - height / 2, width: trackWidth });
  waypoints.push({ x: cx + width / 2, y: cy - height / 2, width: trackWidth });
  
  // Curva derecha superior
  waypoints.push({ x: cx + width / 2 + 50, y: cy - height / 4, width: trackWidth });
  waypoints.push({ x: cx + width / 2 + 50, y: cy, width: trackWidth });
  
  // Primera chicana (zigzag)
  waypoints.push({ x: cx + width / 4, y: cy + 50, width: trackWidth });
  waypoints.push({ x: cx, y: cy - 50, width: trackWidth });
  waypoints.push({ x: cx - width / 4, y: cy + 50, width: trackWidth });
  
  // Curva izquierda inferior
  waypoints.push({ x: cx - width / 2 - 50, y: cy, width: trackWidth });
  waypoints.push({ x: cx - width / 2 - 50, y: cy - height / 4, width: trackWidth });
  
  // Recta inferior (regreso)
  waypoints.push({ x: cx - width / 2, y: cy + height / 2, width: trackWidth });
  waypoints.push({ x: cx, y: cy + height / 2, width: trackWidth });
  waypoints.push({ x: cx + width / 2, y: cy + height / 2, width: trackWidth });
  
  // Curva derecha inferior
  waypoints.push({ x: cx + width / 2 + 80, y: cy + height / 4, width: trackWidth });
  waypoints.push({ x: cx + width / 2 + 80, y: cy - height / 4, width: trackWidth });
  
  // Segunda chicana (zigzag inverso)
  waypoints.push({ x: cx + width / 3, y: cy - 80, width: trackWidth });
  waypoints.push({ x: cx, y: cy + 80, width: trackWidth });
  waypoints.push({ x: cx - width / 3, y: cy - 80, width: trackWidth });
  
  // Curva izquierda superior (regreso al inicio)
  waypoints.push({ x: cx - width / 2 - 80, y: cy - height / 4, width: trackWidth });
  waypoints.push({ x: cx - width / 2 - 80, y: cy - height / 2, width: trackWidth });
  
  return waypoints;
}

export const CircuitThree: TrackData = {
  name: 'Chicanas Extremas',
  totalLaps: 3,
  startX: 400,
  startY: 200,
  startAngle: 0,
  waypoints: generateChicaneWaypoints(800, 600, 600, 500, 160),
};
