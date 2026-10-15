/**
 * RaceScene - Escena principal de carreras
 * Integra circuito, kart, cámara, colisiones y comunicación con React.
 */

import Phaser from 'phaser';
import { Kart } from '../entities/Kart';
import { CircuitOne, getTrackBoundaries, type TrackData } from '../tracks/CircuitOne';
import type { InputState } from '../systems/MovementSystem';
import { detectClosestCollision, type Segment } from '../systems/CollisionUtils';

export type SceneEventCallback = (data: unknown) => void;

export class RaceScene extends Phaser.Scene {
  private kart!: Kart;
  private track!: TrackData;
  private trackGraphics!: Phaser.GameObjects.Graphics;
  private inputState: InputState = {
    accelerating: false,
    braking: false,
    steerLeft: false,
    steerRight: false,
    drifting: false,
  };
  private keyboardInput: Record<string, boolean> = {};
  private isPaused: boolean = false;
  private eventCallbacks: Map<string, SceneEventCallback[]> = new Map();
  private trackBoundaries: {
    inner: Array<{ x1: number; y1: number; x2: number; y2: number }>;
    outer: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  } | null = null;

  constructor() {
    super({ key: 'RaceScene' });
  }

  /**
   * Permite a React registrar callbacks para eventos de la escena.
   */
  onSceneEvent(event: string, callback: SceneEventCallback): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  private emitSceneEvent(event: string, data?: unknown): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  /**
   * Inicializa la escena con datos del circuito.
   */
  init(data: { track?: TrackData }): void {
    this.track = data.track || CircuitOne;
  }

  create(): void {
    // Fondo
    this.cameras.main.setBackgroundColor('#2d5a27');

    // Dibujar circuito
    this.drawTrack();

    // Crear kart
    this.kart = new Kart(
      this,
      this.track.startX,
      this.track.startY,
      this.track.startAngle
    );

    // Configurar cámara
    this.cameras.main.startFollow(this.kart.sprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.2);

    // Configurar colisiones con bordes
    this.setupBoundaryCollisions();

    // Input de teclado
    this.setupKeyboardInput();

    // Emitir evento de escena lista
    this.emitSceneEvent('ready');
  }

  /**
   * Dibuja el circuito completo.
   */
  private drawTrack(): void {
    this.trackGraphics = this.add.graphics();

    const wp = this.track.waypoints;

    // Dibujar como polígono relleno conectando los puntos exteriores
    // Primero outer, luego inner (para crear un anillo)
    const boundaries = getTrackBoundaries(this.track);

    // Outer boundary (sentido horario)
    this.trackGraphics.beginPath();
    if (boundaries.outer.length > 0) {
      this.trackGraphics.moveTo(boundaries.outer[0].x1, boundaries.outer[0].y1);
      for (const seg of boundaries.outer) {
        this.trackGraphics.lineTo(seg.x2, seg.y2);
      }
    }
    this.trackGraphics.closePath();
    this.trackGraphics.fillStyle(0x555555, 1);
    this.trackGraphics.fillPath();

    // Inner boundary (sentido antihorario para crear el hueco)
    this.trackGraphics.beginPath();
    if (boundaries.inner.length > 0) {
      this.trackGraphics.moveTo(boundaries.inner[0].x1, boundaries.inner[0].y1);
      for (const seg of boundaries.inner) {
        this.trackGraphics.lineTo(seg.x2, seg.y2);
      }
    }
    this.trackGraphics.closePath();
    this.trackGraphics.fillStyle(0x2d5a27, 1); // Color del césped interior
    this.trackGraphics.fillPath();

    // Líneas de borde (blancas)
    this.trackGraphics.lineStyle(3, 0xffffff, 0.8);

    // Borde exterior
    this.trackGraphics.beginPath();
    if (boundaries.outer.length > 0) {
      this.trackGraphics.moveTo(boundaries.outer[0].x1, boundaries.outer[0].y1);
      for (const seg of boundaries.outer) {
        this.trackGraphics.lineTo(seg.x2, seg.y2);
      }
    }
    this.trackGraphics.strokePath();

    // Borde interior
    this.trackGraphics.beginPath();
    if (boundaries.inner.length > 0) {
      this.trackGraphics.moveTo(boundaries.inner[0].x1, boundaries.inner[0].y1);
      for (const seg of boundaries.inner) {
        this.trackGraphics.lineTo(seg.x2, seg.y2);
      }
    }
    this.trackGraphics.strokePath();

    // Línea de meta
    const startWp = wp[0];
    const nextWp = wp[1];
    const dx = nextWp.x - startWp.x;
    const dy = nextWp.y - startWp.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const halfW = startWp.width / 2;

    this.trackGraphics.lineStyle(6, 0xffffff, 1);
    this.trackGraphics.beginPath();
    this.trackGraphics.moveTo(startWp.x + nx * halfW, startWp.y + ny * halfW);
    this.trackGraphics.lineTo(startWp.x - nx * halfW, startWp.y - ny * halfW);
    this.trackGraphics.strokePath();

    // Patrón de cuadros en la línea de meta
    const segments = 8;
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const px = startWp.x + nx * halfW * (1 - 2 * t);
      const py = startWp.y + ny * halfW * (1 - 2 * t);
      if (i % 2 === 0) {
        this.trackGraphics.fillStyle(0x000000, 1);
        this.trackGraphics.fillRect(px - 4, py - 4, 8, 8);
      }
    }

    // Decoración: bordillos rojo/blanco en las curvas
    this.drawCurbs(boundaries);
  }

  /**
   * Dibuja bordillos decorativos en los bordes.
   */
  private drawCurbs(boundaries: ReturnType<typeof getTrackBoundaries>): void {
    this.trackGraphics.lineStyle(5, 0xff0000, 0.6);
    const outerSegs = boundaries.outer;
    for (let i = 0; i < outerSegs.length; i += 3) {
      const seg = outerSegs[i];
      this.trackGraphics.beginPath();
      this.trackGraphics.moveTo(seg.x1, seg.y1);
      this.trackGraphics.lineTo(seg.x2, seg.y2);
      this.trackGraphics.strokePath();
    }
  }

  /**
   * Configura las colisiones con los bordes del circuito.
   * NOTA: Arcade Physics no soporta rotación en cuerpos estáticos.
   * Usamos detección manual basada en distancia a los segmentos.
   */
  private setupBoundaryCollisions(): void {
    const boundaries = getTrackBoundaries(this.track);
    this.trackBoundaries = boundaries;
    
    // No creamos cuerpos físicos para los bordes porque Arcade Physics
    // no soporta rotación en cuerpos estáticos. En su lugar, detectamos
    // colisiones manualmente en el update().
  }

  /**
   * Detecta colisiones manuales del kart con los bordes de la pista.
   * Usa la utilidad de colisiones para encontrar la colisión más cercana.
   */
  private checkBoundaryCollisions(): void {
    if (!this.trackBoundaries || !this.kart.body) return;

    const kartPos = this.kart.getPosition();
    const kartRadius = 18; // Radio del cuerpo circular del kart
    const collisionThreshold = kartRadius + 4; // Margen de colisión

    const allSegments: Segment[] = [...this.trackBoundaries.inner, ...this.trackBoundaries.outer];

    const collision = detectClosestCollision(kartPos, collisionThreshold, allSegments);

    if (collision) {
      // Colisión detectada
      this.kart.applyCollisionPenalty();
      this.emitSceneEvent('collision');

      // Aplicar empuje para separar el kart del borde
      const pushForce = (collisionThreshold - collision.distance) * 0.8;
      this.kart.sprite.x += collision.pushVector.x * pushForce;
      this.kart.sprite.y += collision.pushVector.y * pushForce;
    }
  }

  /**
   * Configura el input de teclado.
   */
  private setupKeyboardInput(): void {
    const keys = ['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'SHIFT'];
    for (const key of keys) {
      const k = this.input.keyboard!.addKey(key);
      k.on('down', () => { this.keyboardInput[key] = true; });
      k.on('up', () => { this.keyboardInput[key] = false; });
    }
  }

  update(_time: number, delta: number): void {
    if (this.isPaused) return;

    const dt = delta / 1000;

    // Combinar input de teclado y táctil
    const combinedInput: InputState = {
      accelerating: this.inputState.accelerating || !!this.keyboardInput['W'] || !!this.keyboardInput['UP'],
      braking: this.inputState.braking || !!this.keyboardInput['S'] || !!this.keyboardInput['DOWN'],
      steerLeft: this.inputState.steerLeft || !!this.keyboardInput['A'] || !!this.keyboardInput['LEFT'],
      steerRight: this.inputState.steerRight || !!this.keyboardInput['D'] || !!this.keyboardInput['RIGHT'],
      drifting: this.inputState.drifting || !!this.keyboardInput['SPACE'] || !!this.keyboardInput['SHIFT'],
    };

    // Actualizar kart
    this.kart.update(dt, combinedInput);

    // Detección manual de colisiones con bordes
    if (this.trackBoundaries && this.kart.body) {
      this.checkBoundaryCollisions();
    }

    // Verificar si está fuera de pista (simplificado: distancia al centro del óvalo)
    const pos = this.kart.getPosition();
    const cx = 800, cy = 600, rx = 550, ry = 380;
    const normalizedDist = Math.sqrt(
      Math.pow((pos.x - cx) / rx, 2) + Math.pow((pos.y - cy) / ry, 2)
    );
    this.kart.isOffTrack = normalizedDist > 1.15 || normalizedDist < 0.75;

    // Emitir estado para el HUD
    this.emitSceneEvent('stateUpdate', {
      speed: Math.abs(this.kart.physics.speed),
      maxSpeed: this.kart.physics.maxSpeed,
      isDrifting: this.kart.physics.isDrifting,
      driftCharge: this.kart.physics.driftCharge,
      isOffTrack: this.kart.isOffTrack,
      position: pos,
    });
  }

  /**
   * Establece el estado de input desde los controles táctiles.
   */
  setTouchInput(input: Partial<InputState>): void {
    Object.assign(this.inputState, input);
  }

  /**
   * Pausa la escena.
   */
  pauseRace(): void {
    this.isPaused = true;
    this.physics.world.pause();
    // Reset keyboard input al pausar
    this.keyboardInput = {};
    this.emitSceneEvent('paused');
  }

  /**
   * Reanuda la escena.
   */
  resumeRace(): void {
    this.isPaused = false;
    this.physics.world.resume();
    this.emitSceneEvent('resumed');
  }

  /**
   * Reinicia la carrera (reset de posición y estado).
   */
  restartRace(): void {
    this.isPaused = false;
    // Reset kart position
    this.kart.sprite.setPosition(this.track.startX, this.track.startY);
    this.kart.physics.speed = 0;
    this.kart.physics.angle = this.track.startAngle;
    this.kart.physics.isDrifting = false;
    this.kart.physics.driftCharge = 0;
    this.kart.isOffTrack = false;
    if (this.kart.body) {
      this.kart.body.setVelocity(0, 0);
    }
    // Reset input
    this.inputState = {
      accelerating: false,
      braking: false,
      steerLeft: false,
      steerRight: false,
      drifting: false,
    };
    this.keyboardInput = {};
    this.emitSceneEvent('restarted');
  }

  /**
   * Limpia recursos al destruir la escena.
   */
  shutdown(): void {
    if (this.kart) {
      this.kart.destroy();
    }
    this.eventCallbacks.clear();
    this.trackBoundaries = null;
  }
}
