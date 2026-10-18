/**
 * RaceScene - Escena principal de carreras
 * Integra circuito, kart, cámara, colisiones y comunicación con React.
 */

import Phaser from 'phaser';
import { Kart } from '../entities/Kart';
import { AIKart } from '../entities/AIKart';
import { Coin } from '../entities/Coin';
import { ItemBox, type ItemType } from '../entities/ItemBox';
import { ItemSystem } from '../systems/ItemSystem';
import { CircuitOne, getTrackBoundaries, type TrackData } from '../tracks/CircuitOne';
import { CircuitTwo } from '../tracks/CircuitTwo';
import { CircuitThree } from '../tracks/CircuitThree';
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
  
  // Monedas
  private coins: Coin[] = [];
  private coinCount: number = 0;
  
  // Cajas de items
  private itemBoxes: ItemBox[] = [];
  
  // Sistema de items
  private itemSystem: ItemSystem | null = null;
  private playerItem: ItemType | null = null;
  
  // Vehículo seleccionado
  private vehicleId: string = 'balanced';

  constructor() {
    super({ key: 'RaceScene' });
  }

  /**
   * Establece el vehículo seleccionado.
   */
  setVehicleId(vehicleId: string): void {
    this.vehicleId = vehicleId;
    console.log('RaceScene: Vehicle set to', vehicleId);
  }

  /**
   * Establece el circuito seleccionado.
   */
  setTrackId(trackId: string): void {
    if (trackId === 'circuit2') {
      this.track = CircuitTwo;
    } else if (trackId === 'circuit3') {
      this.track = CircuitThree;
    } else {
      this.track = CircuitOne;
    }
    console.log('RaceScene: Track set to', this.track.name);
  }

  /**
   * Calcula el progreso de un kart (jugador o IA) para rubber banding.
   * Retorna un número que representa qué tan avanzado está el kart.
   */
  private calculateKartProgress(kart: Kart | AIKart): number {
    // Para el jugador, usar las propiedades de RaceScene
    if (kart === this.kart) {
      const lap = this.currentLap;
      const checkpoint = this.lastCheckpoint;
      return (lap - 1) * this.checkpoints.length + checkpoint;
    }
    
    // Para IA, usar sus propiedades
    const aiKart = kart as AIKart;
    const lap = aiKart.currentLap;
    const checkpoint = aiKart.lastCheckpoint;
    
    // Fórmula: (vuelta - 1) * totalCheckpoints + checkpoint
    // Esto da un número que aumenta monótonicamente con el progreso
    return (lap - 1) * this.checkpoints.length + checkpoint;
  }

  /**
   * Aplica las estadísticas del vehículo seleccionado al kart del jugador.
   */
  private applyVehicleStats(): void {
    // Stats base
    const baseMaxSpeed = 320;
    const baseAcceleration = 280;
    const baseTurnRate = 3.2;

    // Multipliers según el vehículo
    let speedMultiplier = 1.0;
    let accelMultiplier = 1.0;
    let handlingMultiplier = 1.0;

    switch (this.vehicleId) {
      case 'speed':
        speedMultiplier = 1.2;
        accelMultiplier = 0.85;
        handlingMultiplier = 0.8;
        break;
      case 'agile':
        speedMultiplier = 0.85;
        accelMultiplier = 1.0;
        handlingMultiplier = 1.3;
        break;
      case 'balanced':
      default:
        // Stats balanceados, sin cambios
        break;
    }

    // Aplicar al kart
    this.kart.physics.maxSpeed = baseMaxSpeed * speedMultiplier;
    this.kart.physics.acceleration = baseAcceleration * accelMultiplier;
    this.kart.physics.turnRate = baseTurnRate * handlingMultiplier;

    console.log(`RaceScene: Applied vehicle stats - Speed: ${speedMultiplier}x, Accel: ${accelMultiplier}x, Handling: ${handlingMultiplier}x`);
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
  init(data: { track?: TrackData; trackId?: string }): void {
    console.log('RaceScene: init() called');
    
    // Seleccionar circuito basado en trackId
    if (data.track) {
      this.track = data.track;
    } else if (data.trackId === 'circuit2') {
      this.track = CircuitTwo;
    } else if (data.trackId === 'circuit3') {
      this.track = CircuitThree;
    } else {
      this.track = CircuitOne;
    }
    
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
      
      // Aplicar stats del vehículo seleccionado
      this.applyVehicleStats();
      console.log('RaceScene: Player kart created with vehicle:', this.vehicleId);

      // Configurar cámara
      this.cameras.main.startFollow(this.kart.sprite, true, 0.08, 0.08);
      this.cameras.main.setZoom(1.2);
      console.log('RaceScene: Camera configured');

      // Configurar colisiones con bordes
      this.setupBoundaryCollisions();
      console.log('RaceScene: Boundary collisions setup');

      // Inicializar checkpoints para sistema de vueltas (ANTES de crear IAs)
      this.setupCheckpoints();
      console.log('RaceScene: Checkpoints setup');

      // Crear rivales IA (DESPUÉS de setupCheckpoints)
      this.createAIKarts();
      console.log('RaceScene: AI karts created');

      // Crear monedas
      this.createCoins();
      console.log('RaceScene: Coins created');

      // Crear cajas de items
      this.createItemBoxes();
      console.log('RaceScene: Item boxes created');

      // Inicializar sistema de items
      this.itemSystem = new ItemSystem(this);
      this.itemSystem.registerKarts([this.kart, ...this.aiKarts]);
      console.log('RaceScene: Item system initialized');

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
   * Crea las monedas en el circuito.
   */
  private createCoins(): void {
    this.coins = [];
    this.coinCount = 0;

    // Generar posiciones de monedas dinámicamente basadas en los waypoints
    const waypoints = this.track.waypoints;
    const coinCount = 10;
    const interval = Math.floor(waypoints.length / coinCount);

    for (let i = 0; i < coinCount; i++) {
      const wpIndex = (i * interval) % waypoints.length;
      const wp = waypoints[wpIndex];
      
      // Crear moneda en el waypoint (centro de la pista)
      const coin = new Coin(this, wp.x, wp.y);
      this.coins.push(coin);
    }
  }

  /**
   * Crea las cajas de items en el circuito.
   */
  private createItemBoxes(): void {
    this.itemBoxes = [];

    // Generar posiciones de cajas de items dinámicamente basadas en los waypoints
    const waypoints = this.track.waypoints;
    const boxCount = 5;
    const interval = Math.floor(waypoints.length / boxCount);

    for (let i = 0; i < boxCount; i++) {
      // Distribuir las cajas en diferentes puntos del circuito
      const wpIndex = ((i * interval) + Math.floor(interval / 2)) % waypoints.length;
      const wp = waypoints[wpIndex];
      
      // Crear caja de items en el waypoint (centro de la pista)
      const itemBox = new ItemBox(this, wp.x, wp.y);
      this.itemBoxes.push(itemBox);
    }
  }

  /**
   * Crea los karts de IA (rivales).
   */
  private createAIKarts(): void {
    this.aiKarts = [];
    
    const aiConfigs: Array<{ name: string; color: number; config: AIConfig; offset: number }> = [
      {
        name: 'Rojo Agresivo',
        color: 0xff6b6b,
        config: { 
          skillLevel: 0.9, 
          maxSpeedMultiplier: 0.92, 
          lookAheadDistance: 4, 
          rubberBandStrength: 0.10,
          personality: 'aggressive'
        },
        offset: 1
      },
      {
        name: 'Azul Técnico',
        color: 0x4ecdc4,
        config: { 
          skillLevel: 0.85, 
          maxSpeedMultiplier: 0.88, 
          lookAheadDistance: 3, 
          rubberBandStrength: 0.12,
          personality: 'technical'
        },
        offset: 2
      },
      {
        name: 'Verde Principiante',
        color: 0x95e1d3,
        config: { 
          skillLevel: 0.75, 
          maxSpeedMultiplier: 0.82, 
          lookAheadDistance: 3, 
          rubberBandStrength: 0.15,
          personality: 'beginner'
        },
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
        // Verificar si completó vuelta ANTES de actualizar lastCheckpoint
        const completedLap = (closestCheckpointIndex === 0 && this.lastCheckpoint === this.checkpoints.length - 1);
        
        console.log(`[Jugador] Checkpoint ${closestCheckpointIndex} detectado. LastCheckpoint: ${this.lastCheckpoint}, ExpectedNext: ${expectedNext}, CompletedLap: ${completedLap}`);
        
        this.lastCheckpoint = closestCheckpointIndex;
        
        // Si completó todos los checkpoints, completar vuelta
        if (completedLap) {
          console.log(`[Jugador] ¡Vuelta completada! Vuelta actual: ${this.currentLap}`);
          this.completeLap();
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

    // Si completó todas las vueltas, terminar la carrera
    if (this.currentLap > this.totalLaps) {
      this.finishRace();
    }
  }

  private finishRace(): void {
    if (this.raceFinished) return; // Evitar múltiples llamadas
    
    this.raceFinished = true;
    
    // Calcular mejor vuelta del jugador
    const bestLap = this.lapTimes.length > 0 
      ? Math.min(...this.lapTimes) 
      : this.raceTime;
    
    // Calcular posiciones finales
    this.calculatePositions();
    
    // Determinar posición del jugador
    const playerPosition = this.positions.findIndex(p => p.isPlayer) + 1;
    
    this.emitSceneEvent('raceFinished', {
      trackName: this.track.name,
      totalTime: this.raceTime,
      lapTimes: [...this.lapTimes],
      bestLap: bestLap,
      totalLaps: this.totalLaps,
      position: playerPosition,
      positions: this.positions
    });
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
        const penaltyApplied = this.kart.applyCollisionPenalty();
        if (penaltyApplied) {
          this.emitSceneEvent('collision');
        }
      }

      // Aplicar empuje para separar el kart del borde (más suave)
      const pushForce = (collisionThreshold - collision.distance) * 0.4; // Reducido de 0.6 a 0.4
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
          const pushX = (dx / distance) * overlap * 0.3; // Reducido de 0.5 a 0.3
          const pushY = (dy / distance) * overlap * 0.3; // Reducido de 0.5 a 0.3

          // Empujar ambos karts en direcciones opuestas
          kart1.sprite.x -= pushX;
          kart1.sprite.y -= pushY;
          kart2.sprite.x += pushX;
          kart2.sprite.y += pushY;

          // Aplicar penalización de velocidad (con cooldown)
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
    const keys = ['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE', 'SHIFT', 'E', 'Q'];
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

    // Usar item con tecla E o Q
    if (this.raceStarted && this.playerItem && (this.keyboardInput['E'] || this.keyboardInput['Q'])) {
      this.usePlayerItem();
      this.keyboardInput['E'] = false;
      this.keyboardInput['Q'] = false;
    }

    // Actualizar kart del jugador
    this.kart.update(dt, effectiveInput);

    // Calcular progreso del jugador para rubber banding
    const playerProgress = this.calculateKartProgress(this.kart);

    // Actualizar karts de IA
    if (this.raceStarted) {
      this.aiKarts.forEach(aiKart => {
        // Calcular progreso de esta IA
        const aiProgress = this.calculateKartProgress(aiKart);
        
        // Actualizar IA con información de progreso para rubber banding
        aiKart.updateAI(dt, playerProgress, aiProgress);
        
        // Colisiones de IA con bordes
        if (this.trackBoundaries && aiKart.body) {
          this.checkAIBoundaryCollisions(aiKart);
        }

        // Verificar si la IA terminó la carrera
        if (!aiKart.finished && aiKart.currentLap > this.totalLaps) {
          console.log(`[IA ${aiKart.name}] ¡CARRERA TERMINADA! Vuelta: ${aiKart.currentLap}, TotalLaps: ${this.totalLaps}`);
          aiKart.markFinished(this.raceTime);
          
          // Si la carrera aún no ha terminado, terminarla
          if (!this.raceFinished) {
            console.log(`[IA ${aiKart.name}] Terminó la carrera. Finalizando juego.`);
            this.finishRace();
          }
        }
      });

      // Colisiones kart-kart
      this.checkKartCollisions();
    }

    // Actualizar monedas
    this.coins.forEach(coin => {
      coin.update(delta);
      
      // Detectar colisión con el kart del jugador
      if (!coin.collected) {
        const kartPos = this.kart.getPosition();
        const coinPos = coin.position;
        const dx = kartPos.x - coinPos.x;
        const dy = kartPos.y - coinPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
          coin.collect();
          this.coinCount++;
          
          // Boost de velocidad al recoger moneda
          this.kart.physics.speed = Math.min(
            this.kart.physics.maxSpeed,
            this.kart.physics.speed + 50
          );
          
          this.emitSceneEvent('coinCollected', { count: this.coinCount });
        }
      }
    });

    // Actualizar cajas de items
    this.itemBoxes.forEach(itemBox => {
      itemBox.update(delta);
      
      // Detectar colisión con el kart del jugador
      if (itemBox.available && !this.playerItem) {
        const kartPos = this.kart.getPosition();
        const boxPos = itemBox.position;
        const dx = kartPos.x - boxPos.x;
        const dy = kartPos.y - boxPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 35) {
          // Calcular posición del jugador para distribución estratégica de items
          const playerPosition = this.getPlayerPosition();
          const totalRacers = this.aiKarts.length + 1; // +1 por el jugador
          
          const item = itemBox.collect(playerPosition, totalRacers);
          if (item) {
            this.playerItem = item;
            this.emitSceneEvent('itemCollected', { item });
          }
        }
      }
    });

    // Actualizar sistema de items
    if (this.itemSystem) {
      this.itemSystem.update();
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
      playerPosition: this.getPlayerPosition(),
      coinCount: this.coinCount,
      playerItem: this.playerItem
    });
  }

  /**
   * Calcula las posiciones de todos los karts en la carrera.
   * Usa una combinación de vueltas completadas + progreso basado en waypoints.
   */
  private calculatePositions(): void {
    // Función auxiliar para calcular progreso basado en waypoint más cercano
    const calculateWaypointProgress = (position: { x: number; y: number }): number => {
      let closestWaypointIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < this.track.waypoints.length; i++) {
        const wp = this.track.waypoints[i];
        const dx = position.x - wp.x;
        const dy = position.y - wp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestWaypointIndex = i;
        }
      }
      
      return closestWaypointIndex;
    };

    // Calcular progreso del jugador
    const playerPos = this.kart.getPosition();
    const playerWaypointProgress = calculateWaypointProgress(playerPos);
    const playerProgress = (this.currentLap - 1) * this.track.waypoints.length + playerWaypointProgress;
    
    // Crear array con todos los karts y su progreso
    const kartProgress = [
      {
        name: 'Jugador',
        isPlayer: true,
        lap: this.currentLap,
        progress: playerProgress,
        waypoint: playerWaypointProgress
      },
      ...this.aiKarts.map(ai => {
        const aiPos = ai.getPosition();
        const aiWaypointProgress = calculateWaypointProgress(aiPos);
        const aiProgress = (ai.currentLap - 1) * this.track.waypoints.length + aiWaypointProgress;
        
        return {
          name: ai.name,
          isPlayer: false,
          lap: ai.currentLap,
          progress: aiProgress,
          waypoint: aiWaypointProgress
        };
      })
    ];

    // Ordenar por progreso (mayor = mejor posición)
    kartProgress.sort((a, b) => b.progress - a.progress);

    // Debug: Log de posiciones cada 3 segundos
    if (this.raceStarted && Math.floor(this.raceTime / 3000) !== Math.floor((this.raceTime - 16) / 3000)) {
      console.log('=== Posiciones ===');
      kartProgress.forEach((kart, index) => {
        console.log(`${index + 1}. ${kart.name}: vuelta=${kart.lap}, waypoint=${kart.waypoint}, progreso=${kart.progress}`);
      });
    }

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
   * Usa el item del jugador.
   */
  usePlayerItem(): void {
    if (!this.playerItem || !this.itemSystem) return;

    this.itemSystem.useItem(this.kart, this.playerItem);
    this.emitSceneEvent('itemUsed', { item: this.playerItem });
    this.playerItem = null;
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
