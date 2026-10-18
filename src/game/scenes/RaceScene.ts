/**
 * RaceScene - Escena principal de carreras
 * Integra circuito, kart, cámara, colisiones y comunicación con React.
 */

import Phaser from 'phaser';
import { Kart } from '../entities/Kart';
import { AIKart } from '../entities/AIKart';
import { CircuitOne, getTrackBoundaries, type TrackData } from '../tracks/CircuitOne';
import type { InputState } from '../systems/MovementSystem';
import { detectClosestCollision, type Segment } from '../systems/CollisionUtils';
import type { AIConfig } from '../systems/AISystem';

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
  
  // Sistema de vueltas
  private currentLap: number = 1;
  private totalLaps: number = 3;
  private lastCheckpoint: number = -1;
  private checkpoints: Array<{ x: number; y: number; radius: number }> = [];
  
  // Cronómetro
  private raceTime: number = 0;           // ms totales de carrera
  private lapTimes: number[] = [];        // tiempos de vueltas completadas
  private currentLapTime: number = 0;     // tiempo de la vuelta actual
  private raceStarted: boolean = false;   // false durante countdown
  private raceFinished: boolean = false;  // true al terminar la carrera
  
  // Rivales IA
  private aiKarts: AIKart[] = [];
  private positions: Array<{ name: string; isPlayer: boolean; lap: number; progress: number }> = [];

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
    console.log('RaceScene: init() called');
    this.track = data.track || CircuitOne;
    console.log('RaceScene: Track initialized:', this.track.name);
  }

  create(): void {
    console.log('RaceScene: create() started');
    
    try {
      // Fondo
      this.cameras.main.setBackgroundColor('#2d5a27');
      console.log('RaceScene: Background set');

      // Dibujar circuito
      this.drawTrack();
      console.log('RaceScene: Track drawn');

      // Crear kart del jugador
      this.kart = new Kart(
        this,
        this.track.startX,
        this.track.startY,
        this.track.startAngle
      );
      console.log('RaceScene: Player kart created');

      // Crear rivales IA
      this.createAIKarts();
      console.log('RaceScene: AI karts created');

      // Configurar cámara
      this.cameras.main.startFollow(this.kart.sprite, true, 0.08, 0.08);
      this.cameras.main.setZoom(1.2);
      console.log('RaceScene: Camera configured');

      // Configurar colisiones con bordes
      this.setupBoundaryCollisions();
      console.log('RaceScene: Boundary collisions setup');

      // Inicializar checkpoints para sistema de vueltas
      this.setupCheckpoints();
      console.log('RaceScene: Checkpoints setup');

      // Input de teclado
      this.setupKeyboardInput();
      console.log('RaceScene: Keyboard input setup');

      // Emitir evento de escena lista
      console.log('RaceScene: Emitting ready event');
      this.emitSceneEvent('ready');
      console.log('RaceScene: create() completed successfully');
    } catch (error) {
      console.error('RaceScene: Error in create():', error);
    }
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
   * Configura los checkpoints para el sistema de vueltas.
   * Distribuye checkpoints uniformemente a lo largo de la pista.
   */
  private setupCheckpoints(): void {
    this.checkpoints = [];
    this.currentLap = 1;
    this.lastCheckpoint = -1;
    this.totalLaps = this.track.totalLaps || 3;

    // Crear checkpoints en posiciones de los waypoints (cada 6 waypoints aproximadamente)
    const waypoints = this.track.waypoints;
    const checkpointInterval = Math.max(1, Math.floor(waypoints.length / 6));
    
    for (let i = 0; i < waypoints.length; i += checkpointInterval) {
      const wp = waypoints[i];
      this.checkpoints.push({
        x: wp.x,
        y: wp.y,
        radius: wp.width * 0.6 // Radio del checkpoint (60% del ancho de pista)
      });
    }
  }

  /**
   * Crea los karts de IA (rivales).
   */
  private createAIKarts(): void {
    this.aiKarts = [];
    
    const aiConfigs: Array<{ name: string; color: number; config: AIConfig; offset: number }> = [
      {
        name: 'Rojo Rápido',
        color: 0xff6b6b,
        config: { skillLevel: 0.9, maxSpeedMultiplier: 0.92, lookAheadDistance: 4 },
        offset: 1
      },
      {
        name: 'Azul Veloz',
        color: 0x4ecdc4,
        config: { skillLevel: 0.85, maxSpeedMultiplier: 0.88, lookAheadDistance: 3 },
        offset: 2
      },
      {
        name: 'Verde Ágil',
        color: 0x95e1d3,
        config: { skillLevel: 0.8, maxSpeedMultiplier: 0.85, lookAheadDistance: 3 },
        offset: 3
      }
    ];

    // Posicionar rivales detrás del jugador
    const startWaypoint = this.track.waypoints[0];
    const angle = this.track.startAngle;
    
    aiConfigs.forEach((ai, index) => {
      // Posicionar en línea detrás del jugador
      const distanceBehind = 60 + (index * 50);
      const offsetX = Math.cos(angle + Math.PI) * distanceBehind;
      const offsetY = Math.sin(angle + Math.PI) * distanceBehind;
      
      // Desplazamiento lateral para que no estén en línea recta
      const lateralOffset = (index % 2 === 0 ? 1 : -1) * 30;
      const lateralX = Math.cos(angle + Math.PI / 2) * lateralOffset;
      const lateralY = Math.sin(angle + Math.PI / 2) * lateralOffset;
      
      const x = startWaypoint.x + offsetX + lateralX;
      const y = startWaypoint.y + offsetY + lateralY;
      
      const aiKart = new AIKart(
        this,
        x,
        y,
        angle,
        this.track.waypoints,
        ai.config,
        ai.name,
        ai.color
      );
      
      // Asignar checkpoints al AIKart
      aiKart.checkpoints = [...this.checkpoints];
      
      // Iniciar en waypoint correspondiente
      aiKart.aiState.currentWaypointIndex = ai.offset;
      
      this.aiKarts.push(aiKart);
    });
  }

  /**
   * Verifica si el kart ha cruzado algún checkpoint.
   */
  private checkCheckpoints(): void {
    if (!this.kart || this.checkpoints.length === 0) return;

    const kartPos = this.kart.getPosition();
    
    // Buscar el checkpoint más cercano
    let closestCheckpointIndex = -1;
    let closestDistance = Infinity;
    
    for (let i = 0; i < this.checkpoints.length; i++) {
      const checkpoint = this.checkpoints[i];
      const dx = kartPos.x - checkpoint.x;
      const dy = kartPos.y - checkpoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < checkpoint.radius && distance < closestDistance) {
        closestDistance = distance;
        closestCheckpointIndex = i;
      }
    }
    
    // Si está dentro de algún checkpoint
    if (closestCheckpointIndex !== -1) {
      // Verificar que sea el siguiente checkpoint en la secuencia
      const expectedNext = (this.lastCheckpoint + 1) % this.checkpoints.length;
      
      if (closestCheckpointIndex === expectedNext) {
        this.lastCheckpoint = closestCheckpointIndex;
        
        // Si acaba de tocar el checkpoint 0 después de haber pasado por todos los demás
        if (closestCheckpointIndex === 0 && this.lastCheckpoint === 0) {
          // Verificar que no sea el inicio de la carrera
          if (this.raceStarted && this.currentLapTime > 0) {
            this.completeLap();
          }
        }
        
        this.emitSceneEvent('checkpoint', {
          checkpoint: closestCheckpointIndex,
          total: this.checkpoints.length
        });
      }
    }
  }

  /**
   * Completa una vuelta.
   */
  private completeLap(): void {
    // Registrar tiempo de esta vuelta
    this.lapTimes.push(this.currentLapTime);
    
    this.emitSceneEvent('lap', {
      lap: this.currentLap,
      total: this.totalLaps,
      lapTime: this.currentLapTime
    });

    this.currentLap++;
    this.currentLapTime = 0; // Reset tiempo de vuelta

    // Si completó todas las vueltas, emitir evento de carrera terminada
    if (this.currentLap > this.totalLaps) {
      this.raceFinished = true;
      
      // Calcular mejor vuelta
      const bestLap = this.lapTimes.length > 0 
        ? Math.min(...this.lapTimes) 
        : this.raceTime;
      
      this.emitSceneEvent('raceFinished', {
        trackName: this.track.name,
        totalTime: this.raceTime,
        lapTimes: [...this.lapTimes],
        bestLap: bestLap,
        totalLaps: this.totalLaps
      });
    }
  }

  /**
   * Detecta colisiones manuales del kart con los bordes de la pista.
   * Usa la utilidad de colisiones para encontrar la colisión más cercana.
   */
  private checkBoundaryCollisions(): void {
    if (!this.trackBoundaries || !this.kart.body) return;

    const kartPos = this.kart.getPosition();
    const kartRadius = 18; // Radio del cuerpo circular del kart
    const collisionThreshold = kartRadius + 2; // Margen de colisión reducido

    const allSegments: Segment[] = [...this.trackBoundaries.inner, ...this.trackBoundaries.outer];

    const collision = detectClosestCollision(kartPos, collisionThreshold, allSegments);

    if (collision) {
      // Solo aplicar penalización si la velocidad es significativa
      if (Math.abs(this.kart.physics.speed) > 50) {
        this.kart.applyCollisionPenalty();
        this.emitSceneEvent('collision');
      }

      // Aplicar empuje para separar el kart del borde (más suave)
      const pushForce = (collisionThreshold - collision.distance) * 0.6;
      this.kart.sprite.x += collision.pushVector.x * pushForce;
      this.kart.sprite.y += collision.pushVector.y * pushForce;
    }
  }

  /**
   * Verifica colisiones de un kart de IA con los bordes.
   */
  private checkAIBoundaryCollisions(aiKart: AIKart): void {
    if (!this.trackBoundaries || !aiKart.body) return;

    const kartPos = aiKart.getPosition();
    const kartRadius = 18;
    const collisionThreshold = kartRadius + 2;

    const allSegments: Segment[] = [...this.trackBoundaries.inner, ...this.trackBoundaries.outer];
    const collision = detectClosestCollision(kartPos, collisionThreshold, allSegments);

    if (collision) {
      if (Math.abs(aiKart.physics.speed) > 50) {
        aiKart.applyCollisionPenalty();
      }

      const pushForce = (collisionThreshold - collision.distance) * 0.6;
      aiKart.sprite.x += collision.pushVector.x * pushForce;
      aiKart.sprite.y += collision.pushVector.y * pushForce;
    }
  }

  /**
   * Verifica colisiones entre karts (jugador vs IA, IA vs IA).
   */
  private checkKartCollisions(): void {
    const allKarts = [this.kart, ...this.aiKarts];
    const kartRadius = 18;
    const collisionDistance = kartRadius * 2;

    for (let i = 0; i < allKarts.length; i++) {
      for (let j = i + 1; j < allKarts.length; j++) {
        const kart1 = allKarts[i];
        const kart2 = allKarts[j];
        
        const pos1 = kart1.getPosition();
        const pos2 = kart2.getPosition();
        
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < collisionDistance && distance > 0) {
          // Colisión detectada
          const overlap = collisionDistance - distance;
          const pushX = (dx / distance) * overlap * 0.5;
          const pushY = (dy / distance) * overlap * 0.5;

          // Empujar ambos karts en direcciones opuestas
          kart1.sprite.x -= pushX;
          kart1.sprite.y -= pushY;
          kart2.sprite.x += pushX;
          kart2.sprite.y += pushY;

          // Aplicar penalización de velocidad
          kart1.applyCollisionPenalty();
          kart2.applyCollisionPenalty();
        }
      }
    }
  }

  /**
   * Verifica si un punto está fuera de los límites de la pista.
   * Un punto está en la pista si está dentro del polígono exterior Y fuera del polígono interior.
   */
  private isPointOffTrack(x: number, y: number): boolean {
    if (!this.trackBoundaries) return false;

    const isInsideOuter = this.isPointInPolygon(x, y, this.trackBoundaries.outer);
    const isInsideInner = this.isPointInPolygon(x, y, this.trackBoundaries.inner);

    // Está en la pista si está dentro del exterior Y fuera del interior
    return !(isInsideOuter && !isInsideInner);
  }

  /**
   * Algoritmo de punto en polígono usando ray casting.
   * Retorna true si el punto (x, y) está dentro del polígono definido por los segmentos.
   */
  private isPointInPolygon(x: number, y: number, segments: Segment[]): boolean {
    if (segments.length === 0) return false;

    let inside = false;
    const n = segments.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = segments[i].x1, yi = segments[i].y1;
      const xj = segments[j].x1, yj = segments[j].y1;

      const intersect = ((yi > y) !== (yj > y)) &&
                        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }

    return inside;
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
    if (this.isPaused || this.raceFinished) return;

    const dt = delta / 1000;

    // Log temporal para debug
    if (Math.random() < 0.01) { // Log solo el 1% de las veces para no saturar
      console.log('RaceScene update - raceStarted:', this.raceStarted, 'speed:', this.kart.physics.speed);
    }

    // Actualizar cronómetro (solo si la carrera ha empezado)
    if (this.raceStarted) {
      this.raceTime += delta;
      this.currentLapTime += delta;
    }

    // Bloquear input durante el countdown
    const effectiveInput: InputState = this.raceStarted ? {
      accelerating: this.inputState.accelerating || !!this.keyboardInput['W'] || !!this.keyboardInput['UP'],
      braking: this.inputState.braking || !!this.keyboardInput['S'] || !!this.keyboardInput['DOWN'],
      steerLeft: this.inputState.steerLeft || !!this.keyboardInput['A'] || !!this.keyboardInput['LEFT'],
      steerRight: this.inputState.steerRight || !!this.keyboardInput['D'] || !!this.keyboardInput['RIGHT'],
      drifting: this.inputState.drifting || !!this.keyboardInput['SPACE'] || !!this.keyboardInput['SHIFT'],
    } : {
      accelerating: false,
      braking: false,
      steerLeft: false,
      steerRight: false,
      drifting: false,
    };

    // Actualizar kart del jugador
    this.kart.update(dt, effectiveInput);

    // Actualizar karts de IA
    if (this.raceStarted) {
      this.aiKarts.forEach(aiKart => {
        aiKart.updateAI(dt);
        
        // Colisiones de IA con bordes
        if (this.trackBoundaries && aiKart.body) {
          this.checkAIBoundaryCollisions(aiKart);
        }
      });

      // Colisiones kart-kart
      this.checkKartCollisions();
    }

    // Detección manual de colisiones con bordes (jugador)
    if (this.trackBoundaries && this.kart.body) {
      this.checkBoundaryCollisions();
    }

    // Verificar si está fuera de pista usando los límites reales
    const pos = this.kart.getPosition();
    this.kart.isOffTrack = this.isPointOffTrack(pos.x, pos.y);

    // Verificar checkpoints para sistema de vueltas
    this.checkCheckpoints();

    // Calcular posiciones de todos los karts
    this.calculatePositions();

    // Emitir estado para el HUD
    this.emitSceneEvent('stateUpdate', {
      speed: Math.abs(this.kart.physics.speed),
      maxSpeed: this.kart.physics.maxSpeed,
      isDrifting: this.kart.physics.isDrifting,
      driftCharge: this.kart.physics.driftCharge,
      isOffTrack: this.kart.isOffTrack,
      position: pos,
      currentLap: this.currentLap,
      totalLaps: this.totalLaps,
      lastCheckpoint: this.lastCheckpoint,
      totalCheckpoints: this.checkpoints.length,
      raceTime: this.raceTime,
      lapTimes: [...this.lapTimes],
      currentLapTime: this.currentLapTime,
      raceStarted: this.raceStarted,
      raceFinished: this.raceFinished,
      positions: this.positions,
      playerPosition: this.getPlayerPosition()
    });
  }

  /**
   * Calcula las posiciones de todos los karts en la carrera.
   */
  private calculatePositions(): void {
    // Calcular el progreso del jugador basado en waypoints
    const playerPos = this.kart.getPosition();
    let playerWaypointIndex = 0;
    let minDistance = Infinity;
    
    // Encontrar el waypoint más cercano al jugador
    for (let i = 0; i < this.track.waypoints.length; i++) {
      const wp = this.track.waypoints[i];
      const dx = playerPos.x - wp.x;
      const dy = playerPos.y - wp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        playerWaypointIndex = i;
      }
    }
    
    // Progreso total = vueltas completadas * waypoints + waypoint actual
    const playerProgress = (this.currentLap - 1) * this.track.waypoints.length + playerWaypointIndex;
    
    // Crear array con todos los karts y su progreso
    const kartProgress = [
      {
        name: 'Jugador',
        isPlayer: true,
        lap: this.currentLap,
        progress: playerProgress
      },
      ...this.aiKarts.map(ai => {
        const aiProgress = (ai.currentLap - 1) * this.track.waypoints.length + ai.getProgress();
        return {
          name: ai.name,
          isPlayer: false,
          lap: ai.currentLap,
          progress: aiProgress
        };
      })
    ];

    // Ordenar por progreso (mayor = mejor posición)
    kartProgress.sort((a, b) => b.progress - a.progress);

    this.positions = kartProgress;
  }

  /**
   * Obtiene la posición del jugador (1-4).
   */
  private getPlayerPosition(): number {
    const playerIndex = this.positions.findIndex(p => p.isPlayer);
    return playerIndex + 1;
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
    this.raceFinished = false;
    this.raceStarted = false;
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
    // Reset vueltas y tiempos
    this.currentLap = 1;
    this.lastCheckpoint = -1;
    this.raceTime = 0;
    this.currentLapTime = 0;
    this.lapTimes = [];
    
    // Reset rivales IA
    this.aiKarts.forEach((aiKart, index) => {
      const startWaypoint = this.track.waypoints[0];
      const angle = this.track.startAngle;
      const distanceBehind = 60 + (index * 50);
      const offsetX = Math.cos(angle + Math.PI) * distanceBehind;
      const offsetY = Math.sin(angle + Math.PI) * distanceBehind;
      const lateralOffset = (index % 2 === 0 ? 1 : -1) * 30;
      const lateralX = Math.cos(angle + Math.PI / 2) * lateralOffset;
      const lateralY = Math.sin(angle + Math.PI / 2) * lateralOffset;
      
      aiKart.sprite.setPosition(
        startWaypoint.x + offsetX + lateralX,
        startWaypoint.y + offsetY + lateralY
      );
      aiKart.physics.speed = 0;
      aiKart.physics.angle = angle;
      aiKart.physics.isDrifting = false;
      aiKart.physics.driftCharge = 0;
      aiKart.finished = false;
      aiKart.aiState.currentWaypointIndex = index + 1;
      aiKart.aiState.stuckTimer = 0;
      
      if (aiKart.body) {
        aiKart.body.setVelocity(0, 0);
      }
    });
    
    this.emitSceneEvent('restarted');
  }

  /**
   * Inicia la carrera (llamado después del countdown).
   */
  startRace(): void {
    console.log('startRace() called, setting raceStarted to true');
    this.raceStarted = true;
    this.emitSceneEvent('raceStarted');
  }

  /**
   * Obtiene el estado actual de la carrera.
   */
  getRaceStatus(): { raceStarted: boolean; raceFinished: boolean } {
    return {
      raceStarted: this.raceStarted,
      raceFinished: this.raceFinished
    };
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
