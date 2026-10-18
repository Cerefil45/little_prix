/**
 * Kart - Entidad del vehículo del jugador
 * Maneja el sprite, la física y la representación visual.
 */

import Phaser from 'phaser';
import {
  type KartPhysics,
  type InputState,
  createKartPhysics,
  updateMovement,
  getVelocityVector,
  PHYSICS,
} from '../systems/MovementSystem';

export class Kart {
  public sprite: Phaser.GameObjects.Graphics;
  public physics: KartPhysics;
  public body: Phaser.Physics.Arcade.Body | null = null;
  public isOffTrack: boolean = false;
  public driftTrail: Phaser.GameObjects.Graphics;
  public lastCollisionTime: number = 0; // Timestamp de la última colisión

  private scene: Phaser.Scene;
  private driftParticles: Array<{ x: number; y: number; alpha: number; size: number }> = [];

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    this.scene = scene;
    this.physics = createKartPhysics();
    this.physics.angle = angle;

    // Crear sprite del kart como gráfico (para no depender de assets externos)
    this.sprite = scene.add.graphics();
    this.sprite.setPosition(x, y);
    this.drawKart();

    // Drift trail
    this.driftTrail = scene.add.graphics();
    this.driftTrail.setDepth(-1);

    // Crear cuerpo de física arcade
    scene.physics.world.enable(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCircle(18);
    this.body.setCollideWorldBounds(false);
    this.body.setDrag(0);
    this.body.setAllowGravity(false);
    this.body.setAngularVelocity(0);
  }

  /**
   * Dibuja el kart como un rectángulo con detalles.
   */
  private drawKart(): void {
    this.sprite.clear();

    // Sombra
    this.sprite.fillStyle(0x000000, 0.3);
    this.sprite.fillRoundedRect(-16, -10, 32, 22, 4);

    // Cuerpo principal
    this.sprite.fillStyle(0xe63946, 1);
    this.sprite.fillRoundedRect(-15, -12, 30, 24, 4);

    // Cabina
    this.sprite.fillStyle(0x1d3557, 1);
    this.sprite.fillRoundedRect(-6, -8, 14, 16, 3);

    // Alerón delantero
    this.sprite.fillStyle(0xf1faee, 1);
    this.sprite.fillRect(12, -14, 4, 28);

    // Ruedas
    this.sprite.fillStyle(0x333333, 1);
    this.sprite.fillRect(-14, -16, 8, 4); // Delante izq
    this.sprite.fillRect(-14, 12, 8, 4);  // Delante der
    this.sprite.fillRect(6, -16, 8, 4);   // Detrás izq
    this.sprite.fillRect(6, 12, 8, 4);    // Detrás der

    // Número
    this.sprite.fillStyle(0xffffff, 1);
    this.sprite.fillCircle(0, 0, 5);
    this.sprite.fillStyle(0xe63946, 1);
    this.sprite.fillRect(-2, -3, 4, 6);

    // Rotar según el ángulo
    this.sprite.setRotation(this.physics.angle);
  }

  /**
   * Actualiza el kart cada frame.
   */
  update(dt: number, input: InputState): void {
    // Actualizar física
    updateMovement(this.physics, input, dt, this.isOffTrack);

    // Calcular velocidad
    const { vx, vy } = getVelocityVector(this.physics);

    // Aplicar velocidad al cuerpo
    if (this.body) {
      this.body.setVelocity(vx, vy);
    }

    // Actualizar posición del sprite (el body ya lo mueve, pero sincronizamos ángulo)
    this.sprite.setRotation(this.physics.angle);

    // Drift trail
    this.updateDriftTrail();
  }

  /**
   * Actualiza el efecto visual del drift.
   */
  private updateDriftTrail(): void {
    this.driftTrail.clear();

    if (this.physics.isDrifting) {
      const x = this.sprite.x;
      const y = this.sprite.y;

      // Partículas de chispas
      this.driftTrail.fillStyle(
        this.physics.driftCharge > 60 ? 0xff6600 : 0xffcc00,
        0.8
      );

      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        const size = Math.random() * 4 + 2;
        this.driftTrail.fillCircle(x + offsetX - Math.cos(this.physics.angle) * 15,
          y + offsetY - Math.sin(this.physics.angle) * 15, size);
      }

      // Líneas de derrape
      this.driftTrail.lineStyle(2, 0x666666, 0.4);
      const backX = this.sprite.x - Math.cos(this.physics.angle) * 18;
      const backY = this.sprite.y - Math.sin(this.physics.angle) * 18;
      this.driftTrail.fillCircle(backX - 8, backY - 8, 3);
      this.driftTrail.fillCircle(backX + 8, backY + 8, 3);
    }

    // Limpiar partículas antiguas
    this.driftParticles = this.driftParticles
      .map(p => ({ ...p, alpha: p.alpha - 0.02 }))
      .filter(p => p.alpha > 0);
  }

  /**
   * Aplica una pérdida de velocidad por colisión con cooldown.
   */
  applyCollisionPenalty(): boolean {
    const now = this.scene.time.now;
    
    // Verificar cooldown
    if (now - this.lastCollisionTime < PHYSICS.COLLISION_COOLDOWN) {
      return false; // Aún en cooldown, no aplicar penalización
    }
    
    this.lastCollisionTime = now;
    this.physics.speed *= PHYSICS.COLLISION_SPEED_LOSS;
    return true; // Penalización aplicada
  }

  /**
   * Obtiene la posición actual.
   */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Destruye el kart y limpia recursos.
   */
  destroy(): void {
    this.sprite.destroy();
    this.driftTrail.destroy();
  }
}
