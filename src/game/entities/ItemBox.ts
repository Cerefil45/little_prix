/**
 * ItemBox - Caja de items
 * Al pasar por encima, otorga un item aleatorio
 */

import Phaser from 'phaser';

export type ItemType = 'turbo' | 'caparazon' | 'platano' | 'estrella' | 'rayo' | 'triple_caparazon';

export class ItemBox {
  public sprite: Phaser.GameObjects.Graphics;
  public body: Phaser.Physics.Arcade.Body | null = null;
  public available: boolean = true;
  public respawnTimer: number = 0;
  public position: { x: number; y: number };
  
  private scene: Phaser.Scene;
  private rotationAngle: number = 0;
  private lastItems: ItemType[] = []; // Historial de últimos items para evitar repeticiones

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
   * Recoge la caja y devuelve un item aleatorio con sistema de pesos
   * Ahora acepta la posición del jugador para distribución estratégica
   */
  collect(playerPosition?: number, totalRacers?: number): ItemType | null {
    if (!this.available) return null;
    
    this.available = false;
    this.sprite.setVisible(false);
    this.respawnTimer = 10000; // 10 segundos para respawn

    // Sistema de pesos basado en posición del jugador
    let weightedItems: Array<{ item: ItemType; weight: number }>;
    
    if (playerPosition !== undefined && totalRacers !== undefined) {
      const positionRatio = playerPosition / totalRacers;
      
      // Primer lugar (1-25%): más items defensivos + chance de estrella
      if (positionRatio <= 0.25) {
        weightedItems = [
          { item: 'platano', weight: 45 },
          { item: 'caparazon', weight: 35 },
          { item: 'turbo', weight: 10 },
          { item: 'estrella', weight: 5 },
          { item: 'triple_caparazon', weight: 5 },
        ];
      }
      // Último lugar (75-100%): más items ofensivos + chance de rayo
      else if (positionRatio >= 0.75) {
        weightedItems = [
          { item: 'turbo', weight: 50 },
          { item: 'caparazon', weight: 25 },
          { item: 'platano', weight: 10 },
          { item: 'rayo', weight: 8 },
          { item: 'triple_caparazon', weight: 7 },
        ];
      }
      // Posición media (25-75%): balanceado con items raros
      else {
        weightedItems = [
          { item: 'turbo', weight: 35 },
          { item: 'caparazon', weight: 30 },
          { item: 'platano', weight: 25 },
          { item: 'estrella', weight: 4 },
          { item: 'rayo', weight: 3 },
          { item: 'triple_caparazon', weight: 3 },
        ];
      }
    } else {
      // Fallback: distribución balanceada con items raros
      weightedItems = [
        { item: 'turbo', weight: 35 },
        { item: 'caparazon', weight: 30 },
        { item: 'platano', weight: 25 },
        { item: 'estrella', weight: 4 },
        { item: 'rayo', weight: 3 },
        { item: 'triple_caparazon', weight: 3 },
      ];
    }

    // Evitar repetir el mismo item si se recogió recientemente
    const availableItems = weightedItems.filter(({ item }) => {
      // Si el mismo item apareció en las últimas 2 veces, reducir su probabilidad
      const recentCount = this.lastItems.filter(i => i === item).length;
      return recentCount < 2;
    });

    // Si todos los items fueron recientes, usar todos
    const itemsToUse = availableItems.length > 0 ? availableItems : weightedItems;

    // Calcular total de pesos
    const totalWeight = itemsToUse.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    // Seleccionar item basado en pesos
    let selectedItem: ItemType = 'turbo';
    for (const { item, weight } of itemsToUse) {
      random -= weight;
      if (random <= 0) {
        selectedItem = item;
        break;
      }
    }

    // Guardar en historial (mantener solo los últimos 2)
    this.lastItems.push(selectedItem);
    if (this.lastItems.length > 2) {
      this.lastItems.shift();
    }

    return selectedItem;
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
