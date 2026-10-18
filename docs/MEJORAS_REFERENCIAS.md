# Mejoras Basadas en Referencias Open Source

## 📋 Recursos Extraídos y Aplicables

### 1. **SuperTuxKart** (GPL v3 / CC BY-SA)
**Repositorio**: https://github.com/supertuxkart/stk-code

#### Conceptos Aplicables:
- ✅ **Sistema de IA con waypoints** - Ya implementado, pero podemos mejorar
- ✅ **Rubber banding** - IA se adapta a la posición del jugador
- ✅ **Diferentes personalidades de IA** - Agresivo, defensivo, equilibrado
- ✅ **Sistema de items con probabilidades** - Basado en posición en carrera
- ✅ **Físicas de drift mejoradas** - Derrape más natural

#### Implementación Prioritaria:
```typescript
// Rubber banding: IA más rápida cuando está atrás
function calculateAISpeed(aiPosition: number, playerPosition: number, baseSpeed: number): number {
  const positionDiff = playerPosition - aiPosition;
  const rubberBandFactor = 1 + (positionDiff * 0.05); // +5% por posición atrás
  return baseSpeed * Math.min(rubberBandFactor, 1.2); // Máximo +20%
}
```

---

### 2. **Mario Kart 64 Decomp** (Educativo)
**Repositorio**: https://github.com/n64decomp/mk64

#### Conceptos Extraídos (SOLO para estudio):
- ✅ **Estrategia de uso de items por IA** (`cpu_use_item_strategy`)
- ✅ **Sistema de drift con mini-turbo** - 3 niveles de boost
- ✅ **Detección de posición basada en checkpoints**
- ✅ **Sistema de "rubber band" para mantener carreras competitivas**

#### Implementación Prioritaria:
```typescript
// Estrategia de items basada en posición (inspirado en MK64)
function chooseItemStrategy(position: number, totalRacers: number): ItemStrategy {
  const positionRatio = position / totalRacers;
  
  if (positionRatio <= 0.25) {
    // En primer lugar: items defensivos
    return { preferred: ['banana', 'caparazon'], aggressive: false };
  } else if (positionRatio >= 0.75) {
    // En último lugar: items ofensivos
    return { preferred: ['turbo', 'caparazon'], aggressive: true };
  } else {
    // En medio: balanceado
    return { preferred: ['turbo', 'banana'], aggressive: false };
  }
}
```

---

### 3. **ArcadeCarPhysics** (MIT)
**Repositorio**: https://github.com/SergeyMakeev/ArcadeCarPhysics

#### Conceptos Aplicables:
- ✅ **Traction control** - Control de tracción en curvas
- ✅ **Drift assist** - Asistencia de drift más suave
- ✅ **Surface friction** - Diferentes tipos de superficie
- ✅ **Weight transfer** - Transferencia de peso en frenado/aceleración

#### Implementación Prioritaria:
```typescript
// Transferencia de peso simplificada
function calculateWeightTransfer(speed: number, acceleration: number, turnRate: number): {
  frontGrip: number;
  rearGrip: number;
} {
  // Al acelerar: más peso atrás (mejor tracción)
  // Al frenar: más peso adelante (mejor frenado)
  // En curva: peso hacia fuera de la curva
  
  const accelWeightTransfer = acceleration * 0.3;
  const brakeWeightTransfer = -acceleration * 0.4;
  const turnWeightTransfer = Math.abs(turnRate) * speed * 0.001;
  
  return {
    frontGrip: 1.0 + brakeWeightTransfer - turnWeightTransfer,
    rearGrip: 1.0 + accelWeightTransfer - turnWeightTransfer
  };
}
```

---

### 4. **JavaScript Racer** (MIT)
**Repositorio**: https://github.com/jakesgordon/javascript-racer

#### Conceptos Aplicables:
- ⚠️ **Renderizado pseudo-3D** - Requiere reescritura significativa
- ✅ **Sistema de curvas con interpolación** - Curvas más suaves
- ✅ **Sprite scaling por distancia** - Efecto de profundidad

#### Implementación (Futura - Requiere más trabajo):
```typescript
// Interpolación de curvas para movimiento más suave
function interpolateCurve(points: Vector2[], t: number): Vector2 {
  const segment = Math.floor(t * (points.length - 1));
  const localT = (t * (points.length - 1)) - segment;
  
  const p0 = points[Math.max(0, segment - 1)];
  const p1 = points[segment];
  const p2 = points[Math.min(points.length - 1, segment + 1)];
  const p3 = points[Math.min(points.length - 1, segment + 2)];
  
  // Catmull-Rom spline
  return catmullRom(p0, p1, p2, p3, localT);
}
```

---

### 5. **Kenney Assets** (CC0 - Dominio Público)
**Web**: https://kenney.nl/assets

#### Assets Utilizables:
- ✅ **Racing Pack** - Sprites de coches (top-down)
- ✅ **UI Pack** - Interfaces completas
- ✅ **Audio Packs** - Efectos de sonido
- ✅ **Sin atribución requerida** - Uso comercial permitido

#### Implementación:
```bash
# Descargar y organizar assets
mkdir -p public/assets/kenney
# Descargar desde: https://kenney.nl/assets/series:Racing
```

---

## 🎯 Plan de Implementación Priorizado

### **FASE 1: Mejoras Inmediatas (1-2 días)**

#### 1.1 Sistema de IA Mejorado con Rubber Banding
**Archivo**: `src/game/systems/AISystem.ts`

```typescript
// Añadir a AIConfig
interface AIConfig {
  // ... existing
  rubberBandStrength: number; // 0.0 - 0.2
  personality: 'aggressive' | 'defensive' | 'balanced';
}

// Implementar en updateAI()
function updateAIWithRubberBand(ai: AIKart, playerPosition: number, aiPosition: number) {
  const positionDiff = playerPosition - aiPosition;
  const speedBoost = 1 + (positionDiff * ai.aiConfig.rubberBandStrength);
  
  // Aplicar boost solo si está atrás
  if (positionDiff > 0) {
    ai.physics.maxSpeed = baseMaxSpeed * Math.min(speedBoost, 1.2);
  }
}
```

#### 1.2 Estrategia de Items por Posición
**Archivo**: `src/game/systems/ItemSystem.ts`

```typescript
function getWeightedItem(playerPosition: number, totalRacers: number): ItemType {
  const positionRatio = playerPosition / totalRacers;
  
  // Primer lugar: más defensivos
  if (positionRatio <= 0.3) {
    return weightedRandom([
      { item: 'banana', weight: 50 },
      { item: 'caparazon', weight: 40 },
      { item: 'turbo', weight: 10 }
    ]);
  }
  // Último lugar: más ofensivos
  else if (positionRatio >= 0.7) {
    return weightedRandom([
      { item: 'turbo', weight: 60 },
      { item: 'caparazon', weight: 30 },
      { item: 'banana', weight: 10 }
    ]);
  }
  // Medio: balanceado
  else {
    return weightedRandom([
      { item: 'turbo', weight: 40 },
      { item: 'caparazon', weight: 35 },
      { item: 'banana', weight: 25 }
    ]);
  }
}
```

#### 1.3 Físicas de Drift Mejoradas
**Archivo**: `src/game/systems/MovementSystem.ts`

```typescript
// Añadir transfer de peso al drift
function updateDriftPhysics(kart: Kart, input: InputState, dt: number) {
  // Calcular grip basado en velocidad y ángulo
  const speedFactor = kart.physics.speed / kart.physics.maxSpeed;
  const driftAngle = Math.abs(kart.physics.driftAngle);
  
  // Menos grip en drift = más deslizamiento
  const gripFactor = 1 - (driftAngle * 0.3) - (speedFactor * 0.2);
  
  // Aplicar al movimiento lateral
  kart.physics.lateralFriction = baseFriction * gripFactor;
}
```

---

### **FASE 2: Contenido y Variedad (3-5 días)**

#### 2.1 Personalidades de IA
**Archivo**: `src/game/entities/AIKart.ts`

```typescript
interface AIPersonality {
  name: string;
  aggressionLevel: number; // 0-1
  corneringSkill: number; // 0-1
  itemUsageSkill: number; // 0-1
  catchUpFactor: number; // 0-0.2
}

const personalities: AIPersonality[] = [
  {
    name: 'Agresivo',
    aggressionLevel: 0.9,
    corneringSkill: 0.6,
    itemUsageSkill: 0.7,
    catchUpFactor: 0.15
  },
  {
    name: 'Técnico',
    aggressionLevel: 0.4,
    corneringSkill: 0.95,
    itemUsageSkill: 0.8,
    catchUpFactor: 0.10
  },
  {
    name: 'Principiante',
    aggressionLevel: 0.3,
    corneringSkill: 0.5,
    itemUsageSkill: 0.4,
    catchUpFactor: 0.05
  }
];
```

#### 2.2 Sistema de Items Expandido
**Archivo**: `src/game/entities/ItemBox.ts`

```typescript
// Nuevos items inspirados en MK64
type ExtendedItemType = 
  | 'turbo'           // Boost rápido
  | 'super_turbo'     // Boost largo (raro)
  | 'banana'          // Trampa
  | 'banana_bunch'    // 3 trampas (raro)
  | 'caparazon'       // Proyectil
  | 'triple_caparazon' // 3 proyectiles (raro)
  | 'estrella'        // Invencibilidad (muy raro)
  | 'rayo';           // Ralentiza a todos excepto al usuario (muy raro)

function getRareItem(): ExtendedItemType {
  return weightedRandom([
    { item: 'super_turbo', weight: 30 },
    { item: 'banana_bunch', weight: 25 },
    { item: 'triple_caparazon', weight: 25 },
    { item: 'estrella', weight: 10 },
    { item: 'rayo', weight: 10 }
  ]);
}
```

#### 2.3 Múltiples Circuitos
**Archivo**: `src/game/tracks/` (crear nuevos archivos)

```typescript
// track2_figure8.ts
export const Track2Figure8: TrackData = {
  name: 'Ocho Loca',
  waypoints: generateFigure8Waypoints(800, 600, 400, 24),
  totalLaps: 3,
  difficulty: 'medium'
};

// track3_chicanes.ts
export const Track3Chicanes: TrackData = {
  name: 'Chicanas Extremas',
  waypoints: generateChicaneWaypoints(800, 600, 24),
  totalLaps: 3,
  difficulty: 'hard'
};
```

---

### **FASE 3: Polish y Audio (2-3 días)**

#### 3.1 Sistema de Audio
**Archivos a crear**: `src/game/audio/AudioManager.ts`

```typescript
// Usar assets de Kenney (CC0)
class AudioManager {
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  
  loadSounds() {
    this.sounds.set('engine', this.scene.sound.add('engine_loop', { loop: true }));
    this.sounds.set('drift', this.scene.sound.add('drift_sfx'));
    this.sounds.set('coin', this.scene.sound.add('coin_sfx'));
    this.sounds.set('item_use', this.scene.sound.add('item_use_sfx'));
    this.sounds.set('collision', this.scene.sound.add('collision_sfx'));
  }
  
  playEngine(speed: number) {
    const engine = this.sounds.get('engine');
    if (engine) {
      engine.setRate(0.5 + (speed / 320) * 1.5); // Pitch basado en velocidad
    }
  }
}
```

#### 3.2 Efectos Visuales Mejorados
**Archivo**: `src/game/entities/Kart.ts`

```typescript
// Partículas de drift mejoradas
function createDriftParticles(scene: Phaser.Scene, kart: Kart) {
  const emitter = scene.add.particles(kart.sprite.x, kart.sprite.y, 'spark', {
    speed: { min: 50, max: 100 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.5, end: 0 },
    lifespan: 500,
    frequency: 50,
    tint: [0xff6600, 0xffcc00, 0xff0000]
  });
  
  return emitter;
}
```

---

## 📦 Assets Recomendados (CC0 / Libres)

### De Kenney.nl (CC0 - Sin atribución):
1. **Racing Pack** - https://kenney.nl/assets/racing
   - Sprites de coches top-down
   - Texturas de carretera
   - UI elements

2. **Audio: Music Jingles** - https://kenney.nl/assets/music-jingles
   - Música de menú
   - Fanfarrias de victoria

3. **UI Pack: RPG Expansion** - https://kenney.nl/assets/ui-rpg-expansion
   - Botones, paneles
   - Iconos

### De OpenGameArt.org:
1. **Car Engine Sounds** - Buscar "car engine loop"
   - Sonidos de motor loop
   - Licencia: CC0

2. **Racing Sound Effects** - Buscar "racing sfx"
   - Derrape, colisión, items
   - Licencia: CC-BY (requiere atribución)

### De SuperTuxKart (CC BY-SA):
1. **Modelos 3D de karts** - Para referencia visual
2. **Texturas de circuitos** - Ideas de diseño
3. **Música de carreras** - Referencia de estilo

---

## ⚖️ Consideraciones Legales

### ✅ PERMITIDO:
- Estudiar código de SuperTuxKart (GPL) para entender conceptos
- Aprender de MK64 decomp (educativo) para mecánicas
- Usar assets de Kenney (CC0) sin atribución
- Usar assets de OpenGameArt con atribución (CC-BY)
- Implementar conceptos similares con código propio

### ❌ PROHIBIDO:
- Copiar código de MK64 directamente
- Usar assets originales de Nintendo
- Distribuir ROMs o dumps
- Crear un clone idéntico de Mario Kart

### 📝 ATRIBUCIÓN REQUERIDA:
```
// Si usas assets CC-BY de OpenGameArt:
/*
 * Sound effects from OpenGameArt.org
 * "Racing SFX Pack" by [Author]
 * License: CC-BY 3.0
 * https://opengameart.org/content/[url]
 */
```

---

## 🚀 Orden de Implementación Recomendado

### Semana 1: Fundamentos
1. ✅ Rubber banding para IA (2h)
2. ✅ Estrategia de items por posición (3h)
3. ✅ Físicas de drift mejoradas (4h)
4. ✅ Personalidades de IA (3h)

### Semana 2: Contenido
5. ✅ Sistema de items expandido (4h)
6. ✅ Segundo circuito (4h)
7. ✅ Tercer circuito (4h)
8. ✅ Selección de circuito (2h)

### Semana 3: Polish
9. ✅ Sistema de audio (4h)
10. ✅ Efectos visuales mejorados (3h)
11. ✅ Assets de Kenney (2h)
12. ✅ Balance final (3h)

---

## 📊 Métricas de Éxito

### Indicadores de Mejora:
- [ ] IA mantiene carreras competitivas (rubber banding)
- [ ] Items se sienten más estratégicos
- [ ] Drift se siente más natural y satisfactorio
- [ ] 3 circuitos diferentes jugables
- [ ] Audio completo sin bugs
- [ ] FPS estable en móvil (30+ FPS)

### Testing:
```bash
# Probar rubber banding
# 1. Dejar que IA te adelante
# 2. Verificar que IA reduce velocidad ligeramente
# 3. Verificar que puedes alcanzarla

# Probar estrategia de items
# 1. Ir en primer lugar
# 2. Verificar que obtienes más bananas/caparazones
# 3. Ir en último lugar
# 4. Verificar que obtienes más turbos
```

---

## 🔗 Enlaces de Referencia

### Código Open Source:
- SuperTuxKart: https://github.com/supertuxkart/stk-code
- MK64 Decomp: https://github.com/n64decomp/mk64
- ArcadeCarPhysics: https://github.com/SergeyMakeev/ArcadeCarPhysics
- JavaScript Racer: https://github.com/jakesgordon/javascript-racer

### Assets Libres:
- Kenney: https://kenney.nl/assets
- OpenGameArt: https://opengameart.org
- itch.io Assets: https://itch.io/game-assets/free

### Tutoriales:
- Jake Gordon Racing Tutorial: https://jakesgordon.com/writing/javascript-racer/
- Implementing Racing Games: https://www.gamedeveloper.com/design/implementing-racing-games

---

## 📝 Notas Finales

### Prioridades:
1. **Rubber banding** - Mejora más impactante con menos esfuerzo
2. **Estrategia de items** - Hace el juego más estratégico
3. **Físicas mejoradas** - Mejora la sensación de juego
4. **Más contenido** - Aumenta la rejugabilidad

### Riesgos:
- ⚠️ Rubber banding muy agresivo puede frustrar al jugador
- ⚠️ Demasiados items pueden saturar la pantalla
- ⚠️ Físicas muy realistas pueden no ser divertidas

### Recomendación:
Implementar en orden, probar cada cambio, y ajustar según feedback.
No implementar todo de golpe, sino iterativamente.
