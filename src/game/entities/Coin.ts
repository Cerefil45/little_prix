/**
 * Coin - Moneda coleccionable
 * Se recoge al pasar por encima y da boost de velocidad
 */

import Phaser from 'phaser';

export class Coin {
  public sprite: Phaser.GameObjects.Graphics;
  public body: Phaser.Physics.Arcade.Body | null = null;
  public collected: boolean = false;
  public respawnTimer: number = 0;
  public position: { x: number; y: number };
  
  private scene: Phaser.Scene;
  private rotationAngle: number = 0;
  private baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.position = { x, y };
    this.baseY = y;

    // Crear sprite de moneda
    this.sprite = scene.add.graphics();
    this.sprite.setPosition(x, y);
    this.drawCoin();

    // Crear cuerpo de física
    scene.physics.world.enable(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCircle(12);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }

  /**
   * Dibuja la moneda con efecto de rotación
   */
  private drawCoin(): void {
    this.sprite.clear();

    // Simular rotación con escala horizontal
    const scaleX = Math.abs(Math.cos(this.rotationAngle));
    
    // Círculo exterior (borde dorado)
    this.sprite.fillStyle(0xffd700, 1);
    this.sprite.fillEllipse(0, 0, 24 * scaleX, 24);

    // Círculo interior (centro brillante)
    this.sprite.fillStyle(0xffed4e, 1);
    this.sprite.fillEllipse(0, 0, 16 * scaleX, 16);

    // Símbolo central (estrella simplificada)
    if (scaleX > 0.3) {
      this.sprite.fillStyle(0xffa500, 1);
      this.sprite.fillRect(-2 * scaleX, -4, 4 * scaleX, 8);
      this.sprite.fillRect(-4 * scaleX, -2, 8 * scaleX, 4);
    }

    // Brillo
    this.sprite.fillStyle(0xffffff, 0.6);
    this.sprite.fillEllipse(-4 * scaleX, -4, 4 * scaleX, 4);
  }

  /**
   * Actualiza la moneda cada frame
   */
  update(delta: number): void {
    if (this.collected) {
      // Contador de respawn
      this.respawnTimer -= delta;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
    } else {
      // Animación de flotación
      this.rotationAngle += delta * 0.005;
      this.sprite.y = this.baseY + Math.sin(this.rotationAngle * 2) * 3;
      
      // Redibujar con rotación
      this.drawCoin();
    }
  }

  /**
   * Recoge la moneda
   */
  collect(): void {
    if (this.collected) return;
    
    this.collected = true;
    this.sprite.setVisible(false);
    this.respawnTimer = 5000; // 5 segundos para respawn
  }

  /**
   * Hace respawn de la moneda
   */
  private respawn(): void {
    this.collected = false;
    this.sprite.setVisible(true);
    this.sprite.setPosition(this.position.x, this.position.y);
  }

  /**
   * Destruye la moneda
   */
  destroy(): void {
    this.sprite.destroy();
  }
}
