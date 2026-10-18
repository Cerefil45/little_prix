/**
 * Item - Sistema de items utilizables
 * Maneja la lógica de uso y efectos de cada tipo de item
 */

import Phaser from 'phaser';
import type { Kart } from '../entities/Kart';
import type { AIKart } from '../entities/AIKart';

export type ItemType = 'turbo' | 'caparazon' | 'platano' | 'estrella' | 'rayo' | 'triple_caparazon';

export interface ItemEffect {
  type: ItemType;
  duration: number;
  startTime: number;
  target?: Kart | AIKart;
  projectile?: Phaser.GameObjects.Graphics;
  trap?: Phaser.GameObjects.Graphics;
}

export class ItemSystem {
  private scene: Phaser.Scene;
  private activeEffects: ItemEffect[] = [];
  private allKarts: (Kart | AIKart)[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Registra todos los karts para poder aplicar efectos
   */
  registerKarts(karts: (Kart | AIKart)[]): void {
    this.allKarts = karts;
  }

  /**
   * Usa un item desde un kart
   */
  useItem(kart: Kart | AIKart, itemType: ItemType): void {
    const effect: ItemEffect = {
      type: itemType,
      duration: 0,
      startTime: this.scene.time.now,
      target: kart,
    };

    switch (itemType) {
      case 'turbo':
        this.applyTurbo(effect);
        break;
      case 'caparazon':
        this.applyCaparazon(effect);
        break;
      case 'platano':
        this.applyPlatano(effect);
        break;
      case 'estrella':
        this.applyEstrella(effect);
        break;
      case 'rayo':
        this.applyRayo(effect);
        break;
      case 'triple_caparazon':
        this.applyTripleCaparazon(effect);
        break;
    }

    this.activeEffects.push(effect);
  }

  /**
   * Aplica efecto de turbo
   */
  private applyTurbo(effect: ItemEffect): void {
    if (!effect.target) return;

    effect.duration = 3000; // 3 segundos
    
    // Boost de velocidad
    effect.target.physics.maxSpeed *= 1.5;
    effect.target.physics.acceleration *= 1.3;

    // Efecto visual: estela de fuego
    const trail = this.scene.add.graphics();
    trail.setDepth(1);
    effect.projectile = trail;

    // Actualizar estela cada frame
    this.scene.events.on('update', () => {
      if (!effect.target || !effect.projectile) return;
      
      trail.clear();
      const pos = effect.target.getPosition();
      const angle = effect.target.physics.angle;
      
      // Dibujar estela detrás del kart
      for (let i = 0; i < 5; i++) {
        const offset = i * 8;
        const x = pos.x - Math.cos(angle) * (20 + offset);
        const y = pos.y - Math.sin(angle) * (20 + offset);
        const alpha = 1 - (i / 5);
        const size = 8 - i;
        
        trail.fillStyle(0xff6600, alpha);
        trail.fillCircle(x, y, size);
        trail.fillStyle(0xffcc00, alpha * 0.7);
        trail.fillCircle(x, y, size * 0.6);
      }
    });
  }

  /**
   * Aplica efecto de caparazón
   */
  private applyCaparazon(effect: ItemEffect): void {
    if (!effect.target) return;

    effect.duration = 2000; // 2 segundos de vuelo

    // Crear proyectil
    const projectile = this.scene.add.graphics();
    projectile.setDepth(10);
    projectile.setPosition(effect.target.sprite.x, effect.target.sprite.y);
    
    // Dibujar caparazón
    projectile.fillStyle(0x00ff00, 1);
    projectile.fillCircle(0, 0, 12);
    projectile.fillStyle(0x00aa00, 1);
    projectile.fillCircle(0, 0, 8);
    
    effect.projectile = projectile;

    // Encontrar kart más cercano (que no sea el usuario)
    let closestKart: Kart | AIKart | null = null;
    let closestDistance = Infinity;

    for (const kart of this.allKarts) {
      if (kart === effect.target) continue;
      
      const pos1 = effect.target.getPosition();
      const pos2 = kart.getPosition();
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestKart = kart;
      }
    }

    // Mover proyectil hacia el kart más cercano
    if (closestKart) {
      const targetPos = closestKart.getPosition();
      const dx = targetPos.x - effect.target.sprite.x;
      const dy = targetPos.y - effect.target.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = 400; // velocidad del proyectil
      
      const velocityX = (dx / distance) * speed;
      const velocityY = (dy / distance) * speed;

      // Animación de movimiento
      const tween = this.scene.tweens.add({
        targets: projectile,
        x: targetPos.x,
        y: targetPos.y,
        duration: (distance / speed) * 1000,
        onComplete: () => {
          // Impacto: detener al kart objetivo
          if (closestKart) {
            closestKart.physics.speed = 0;
            closestKart.physics.maxSpeed *= 0.3; // Reducir velocidad máxima temporalmente
            
            // Efecto de aturdimiento
            this.scene.time.delayedCall(2000, () => {
              if (closestKart) {
                closestKart.physics.maxSpeed = 320; // Restaurar velocidad
              }
            });
          }
          
          // Destruir proyectil
          projectile.destroy();
          effect.projectile = undefined;
        },
      });
    }
  }

  /**
   * Aplica efecto de plátano
   */
  private applyPlatano(effect: ItemEffect): void {
    if (!effect.target) return;

    effect.duration = 10000; // 10 segundos en el suelo

    // Crear trampa detrás del kart
    const trap = this.scene.add.graphics();
    trap.setDepth(0);
    
    const pos = effect.target.getPosition();
    const angle = effect.target.physics.angle;
    const trapX = pos.x - Math.cos(angle) * 40;
    const trapY = pos.y - Math.sin(angle) * 40;
    
    trap.setPosition(trapX, trapY);
    
    // Dibujar plátano
    trap.fillStyle(0xffff00, 1);
    trap.fillEllipse(0, 0, 20, 12);
    trap.fillStyle(0xcccc00, 1);
    trap.fillEllipse(0, -2, 16, 8);
    
    effect.trap = trap;

    // Verificar colisión con otros karts
    this.scene.events.on('update', () => {
      if (!effect.trap) return;

      for (const kart of this.allKarts) {
        if (kart === effect.target) continue;
        
        const kartPos = kart.getPosition();
        const dx = kartPos.x - trapX;
        const dy = kartPos.y - trapY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 25) {
          // Kart pisó el plátano
          kart.physics.speed = 0;
          kart.physics.maxSpeed *= 0.2; // Reducir mucho la velocidad
          
          // Efecto de derrape
          this.scene.time.delayedCall(1500, () => {
            kart.physics.maxSpeed = 320; // Restaurar velocidad
          });
          
          // Destruir trampa
          trap.destroy();
          effect.trap = undefined;
          break;
        }
      }
    });
  }

  /**
   * Aplica efecto de estrella (invencibilidad + boost)
   */
  private applyEstrella(effect: ItemEffect): void {
    if (!effect.target) return;

    effect.duration = 8000; // 8 segundos
    
    // Boost de velocidad y invencibilidad
    effect.target.physics.maxSpeed *= 1.6;
    effect.target.physics.acceleration *= 1.4;

    // Efecto visual: brillo dorado
    const glow = this.scene.add.graphics();
    glow.setDepth(2);
    effect.projectile = glow;

    // Actualizar brillo cada frame
    this.scene.events.on('update', () => {
      if (!effect.target || !effect.projectile) return;
      
      glow.clear();
      const pos = effect.target.getPosition();
      
      // Dibujar brillo alrededor del kart
      const time = this.scene.time.now * 0.005;
      const pulse = Math.sin(time) * 0.3 + 0.7;
      
      glow.fillStyle(0xffd700, pulse * 0.5);
      glow.fillCircle(pos.x, pos.y, 35);
      glow.fillStyle(0xffff00, pulse * 0.3);
      glow.fillCircle(pos.x, pos.y, 25);
    });
  }

  /**
   * Aplica efecto de rayo (ralentiza a todos los demás)
   */
  private applyRayo(effect: ItemEffect): void {
    if (!effect.target) return;

    effect.duration = 3000; // 3 segundos
    
    // Ralentizar a todos los demás karts
    for (const kart of this.allKarts) {
      if (kart === effect.target) continue;
      
      kart.physics.maxSpeed *= 0.5;
      kart.physics.speed *= 0.6;
    }

    // Efecto visual: rayo cayendo
    const lightning = this.scene.add.graphics();
    lightning.setDepth(3);
    effect.projectile = lightning;

    // Animación de rayo
    const pos = effect.target.getPosition();
    lightning.lineStyle(4, 0xffff00, 1);
    lightning.beginPath();
    lightning.moveTo(pos.x, pos.y - 100);
    lightning.lineTo(pos.x - 10, pos.y - 50);
    lightning.lineTo(pos.x + 10, pos.y - 50);
    lightning.lineTo(pos.x, pos.y);
    lightning.strokePath();

    // Desaparecer después de 500ms
    this.scene.time.delayedCall(500, () => {
      lightning.destroy();
      effect.projectile = undefined;
    });
  }

  /**
   * Aplica efecto de triple caparazón (3 proyectiles)
   */
  private applyTripleCaparazon(effect: ItemEffect): void {
    if (!effect.target) return;

    effect.duration = 5000; // 5 segundos para los 3 proyectiles

    // Crear 3 proyectiles
    const projectiles: Phaser.GameObjects.Graphics[] = [];
    
    for (let i = 0; i < 3; i++) {
      const projectile = this.scene.add.graphics();
      projectile.setDepth(10);
      
      const pos = effect.target.getPosition();
      const angle = effect.target.physics.angle;
      const offset = (i - 1) * 30; // Separación entre proyectiles
      
      projectile.setPosition(
        pos.x + Math.cos(angle + Math.PI / 2) * offset,
        pos.y + Math.sin(angle + Math.PI / 2) * offset
      );
      
      // Dibujar caparazón
      projectile.fillStyle(0x00ff00, 1);
      projectile.fillCircle(0, 0, 12);
      projectile.fillStyle(0x00aa00, 1);
      projectile.fillCircle(0, 0, 8);
      
      projectiles.push(projectile);
    }

    effect.projectile = projectiles[0]; // Guardar referencia

    // Encontrar los 3 karts más cercanos (excluyendo al usuario)
    const targetKarts: (Kart | AIKart)[] = [];
    const userPos = effect.target.getPosition();
    
    const otherKarts = this.allKarts
      .filter(k => k !== effect.target)
      .map(k => ({
        kart: k,
        distance: Math.sqrt(
          Math.pow(k.getPosition().x - userPos.x, 2) +
          Math.pow(k.getPosition().y - userPos.y, 2)
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(k => k.kart);

    // Lanzar proyectiles hacia los objetivos
    projectiles.forEach((projectile, index) => {
      if (index >= otherKarts.length) {
        // Si no hay suficiente objetivos, destruir proyectil
        this.scene.time.delayedCall(100, () => projectile.destroy());
        return;
      }

      const target = otherKarts[index];
      const targetPos = target.getPosition();
      const projPos = { x: projectile.x, y: projectile.y };
      
      const dx = targetPos.x - projPos.x;
      const dy = targetPos.y - projPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = 350;

      // Animación de movimiento
      this.scene.tweens.add({
        targets: projectile,
        x: targetPos.x,
        y: targetPos.y,
        duration: (distance / speed) * 1000,
        onComplete: () => {
          // Impacto: detener al kart objetivo
          target.physics.speed = 0;
          target.physics.maxSpeed *= 0.3;
          
          // Efecto de aturdimiento
          this.scene.time.delayedCall(2000, () => {
            target.physics.maxSpeed = 320;
          });
          
          projectile.destroy();
        },
      });
    });
  }

  /**
   * Actualiza todos los efectos activos
   */
  update(): void {
    const now = this.scene.time.now;

    // Remover efectos expirados
    this.activeEffects = this.activeEffects.filter(effect => {
      const elapsed = now - effect.startTime;
      
      if (elapsed >= effect.duration) {
        // Efecto expirado, limpiar
        this.cleanupEffect(effect);
        return false;
      }
      
      return true;
    });
  }

  /**
   * Limpia un efecto cuando expira
   */
  private cleanupEffect(effect: ItemEffect): void {
    // Restaurar stats del kart si es turbo
    if (effect.type === 'turbo' && effect.target) {
      effect.target.physics.maxSpeed = 320;
      effect.target.physics.acceleration = 280;
    }

    // Destruir proyectiles
    if (effect.projectile) {
      effect.projectile.destroy();
      effect.projectile = undefined;
    }

    // Destruir trampas después de su duración
    if (effect.type === 'platano' && effect.trap) {
      effect.trap.destroy();
      effect.trap = undefined;
    }
  }

  /**
   * Destruye todos los efectos
   */
  destroy(): void {
    for (const effect of this.activeEffects) {
      this.cleanupEffect(effect);
    }
    this.activeEffects = [];
    this.scene.events.off('update');
  }
}
