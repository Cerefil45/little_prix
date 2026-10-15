/**
 * RaceScene - Escena principal de carreras
 * Integra circuito, kart, cámara, colisiones y comunicación con React.
 */

import Phaser from 'phaser';
import { Kart } from '../entities/Kart';
import { CircuitOne, getTrackBoundaries, type TrackData } from '../tracks/CircuitOne';
import type { InputState } from '../systems/MovementSystem';

export type SceneEventCallback = (data: unknown) => void;

export class RaceScene extends Phaser.Scene {
  private kart!: Kart;
  private track!: TrackData;
  private trackGraphics!: Phaser.GameObjects.Graphics;
  private boundaryBodies: Phaser.GameObjects.Rectangle[] = [];
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
   */
  private setupBoundaryCollisions(): void {
    const boundaries = getTrackBoundaries(this.track);

    // Crear cuerpos estáticos para cada segmento del borde
    const allSegments = [...boundaries.inner, ...boundaries.outer];

    for (const seg of allSegments) {
      const midX = (seg.x1 + seg.x2) / 2;
      const midY = (seg.y1 + seg.y2) / 2;
      const dx = seg.x2 - seg.x1;
      const dy = seg.y2 - seg.y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const rect = this.add.rectangle(midX, midY, length, 8);
      rect.setVisible(false);
      this.physics.add.existing(rect, true); // true = static body
      rect.setRotation(angle);
      this.boundaryBodies.push(rect);
    }

    // Colisión del kart con los bordes
    if (this.kart.body) {
      for (const boundary of this.boundaryBodies) {
        this.physics.add.collider(this.kart.sprite, boundary, () => {
          this.kart.applyCollisionPenalty();
          this.emitSceneEvent('collision');
        });
      }
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
    this.emitSceneEvent('restarted');
  }

  /**
   * Limpia recursos al destruir la escena.
   */
  shutdown(): void {
    if (this.kart) {
      this.kart.destroy();
    }
    this.boundaryBodies.forEach(b => b.destroy());
    this.eventCallbacks.clear();
  }
}
