/**
 * Tipos del dominio del juego.
 * Compartidos entre React y Phaser.
 */

export interface RaceResult {
  trackName: string;
  totalTime: number;       // ms
  lapTimes: number[];      // ms por vuelta
  bestLap: number;         // ms
  totalLaps: number;
  finishedAt: number;      // timestamp
  position?: number;       // posición final del jugador (1-4)
}

export interface BestRecord {
  trackName: string;
  bestTime: number;        // ms
  bestLap: number;         // ms
  lapTimes: number[];
  achievedAt: number;      // timestamp
}

export interface RaceState {
  speed: number;
  maxSpeed: number;
  isDrifting: boolean;
  driftCharge: number;
  isOffTrack: boolean;
  position: { x: number; y: number };
  currentLap: number;
  totalLaps: number;
  lastCheckpoint: number;
  totalCheckpoints: number;
  raceTime: number;        // ms transcurridos
  lapTimes: number[];      // tiempos de vueltas completadas
  currentLapTime: number;  // tiempo de la vuelta actual
}
