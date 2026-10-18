/**
 * ItemBox - Caja de items
 * Al pasar por encima, otorga un item aleatorio
 */

import Phaser from 'phaser';

export type ItemType = 'turbo' | 'caparazon' | 'platano';

export class ItemBox {
  public sprite: Phaser.GameObjects.Graphics;
  public body: Phaser.Physics.Arcade.Body | null = null;
  public available: boolean = true;
  public respawnTimer: number = 0;
  public position: { x: number; y: number };
  
  private scene: Phaser.Scene;
  private rotationAngle: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.position = { x, y };

    // Crear sprite de caja
    this.sprite = scene.add.graphics();
    this.sprite.setPosition(x, y);
    this.drawBox();

    // Crear cuerpo de física
    scene.physics.world.enable(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCircle(18);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }

  /**
   * Dibuja la caja con efecto de rotación
   */
  private drawBox(): void {
    this.sprite.clear();

    // Rotación visual
    const rotation = this.rotationAngle;
    
    // Caja exterior
    this.sprite.fillStyle(0x8b4513, 1);
    this.sprite.fillRect(-18, -18, 36, 36);

    // Borde de la caja
    this.sprite.lineStyle(2, 0x654321, 1);
    this.sprite.strokeRect(-18, -18, 36, 36);

    // Patrón de cruz en la caja
    this.sprite.lineStyle(3, 0xffd700, 1);
    this.sprite.strokeRect(-12, -12, 24, 24);

    // Signo de interrogación animado
    const bounce = Math.sin(rotation * 3) * 2;
    this.sprite.fillStyle(0xffffff, 1);
    this.sprite.fillCircle(0, bounce, 8);
    
    // Signo "?"
    this.sprite.fillStyle(0xff6b6b, 1);
    this.sprite.fillRect(-2, -4 + bounce, 4, 6);
    this.sprite.fillRect(-2, 3 + bounce, 4, 2);
  }

  /**
   * Actualiza la caja cada frame
   */
  update(delta: number): void {
    if (!this.available) {
      // Contador de respawn
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
    } else {
      // Animación de rotación
      this.rotationAngle += delta * 0.003;
      this.drawBox();
    }
  }

  /**
   * Recoge la caja y devuelve un item aleatorio
   */
  collect(): ItemType | null {
    if (!this.available) return null;
    
    this.available = false;
    this.sprite.setVisible(false);
    this.respawnTimer = 10000; // 10 segundos para respawn

    // Item aleatorio
    const items: ItemType[] = ['turbo', 'caparazon', 'platano'];
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Hace respawn de la caja
   */
  private respawn(): void {
    this.available = true;
    this.sprite.setVisible(true);
    this.sprite.setPosition(this.position.x, this.position.y);
  }

  /**
   * Destruye la caja
   */
  destroy(): void {
    this.sprite.destroy();
  }
}
