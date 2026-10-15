import { useState } from 'react';

const sections = [
  { id: 'overview', label: '0. Resumen', icon: '🏁' },
  { id: 'architecture', label: '1. Arquitectura', icon: '🏗️' },
  { id: 'directory', label: '2. Directorios', icon: '📁' },
  { id: 'entities', label: '3. Entidades y Sistemas', icon: '🎮' },
  { id: 'movement', label: '4. Movimiento y Circuitos', icon: '🏎️' },
  { id: 'controls', label: '5. Controles Táctiles', icon: '👆' },
  { id: 'testing', label: '6. Plan de Pruebas', icon: '🧪' },
  { id: 'deploy', label: '7. Despliegue', icon: '🚀' },
  { id: 'timeline', label: '8. Cronograma', icon: '📅' },
  { id: 'risks', label: '9. Riesgos', icon: '⚠️' },
  { id: 'tasks', label: '10. Tareas MVP', icon: '✅' },
  { id: 'comparison', label: 'Bonus: 2D vs Pseudo-3D', icon: '🔍' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏎️</span>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Little Grand Prix</h1>
              <p className="text-xs text-gray-400">Plan Técnico — Fase de Diseño</p>
            </div>
          </div>
          <button
            className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded">React</span>
            <span className="px-2 py-1 bg-blue-900/50 text-blue-400 rounded">Phaser 3</span>
            <span className="px-2 py-1 bg-purple-900/50 text-purple-400 rounded">TypeScript</span>
            <span className="px-2 py-1 bg-cyan-900/50 text-cyan-400 rounded">Tailwind</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar Navigation */}
        <nav className={`
          fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-gray-900 border-r border-gray-800
          overflow-y-auto z-40 transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActiveSection(s.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  activeSection === s.id
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800 mt-4">
            <div className="text-xs text-gray-500 space-y-1">
              <p>📌 Estado: Planificación</p>
              <p>👤 Equipo: 1 persona</p>
              <p>⏱️ Duración: 2–4 semanas</p>
              <p>📱 Plataforma: Móvil web</p>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 md:p-8 max-w-full overflow-x-hidden">
          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'architecture' && <ArchitectureSection />}
          {activeSection === 'directory' && <DirectorySection />}
          {activeSection === 'entities' && <EntitiesSection />}
          {activeSection === 'movement' && <MovementSection />}
          {activeSection === 'controls' && <ControlsSection />}
          {activeSection === 'testing' && <TestingSection />}
          {activeSection === 'deploy' && <DeploySection />}
          {activeSection === 'timeline' && <TimelineSection />}
          {activeSection === 'risks' && <RisksSection />}
          {activeSection === 'tasks' && <TasksSection />}
          {activeSection === 'comparison' && <ComparisonSection />}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
}

/* ============ SECTION COMPONENTS ============ */

function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white">{children}</h2>
      {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-900/50 text-blue-300 border-blue-700',
    green: 'bg-green-900/50 text-green-300 border-green-700',
    red: 'bg-red-900/50 text-red-300 border-red-700',
    yellow: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    purple: 'bg-purple-900/50 text-purple-300 border-purple-700',
    gray: 'bg-gray-800 text-gray-300 border-gray-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}

/* ---- 0. OVERVIEW ---- */
function OverviewSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Documento de planificación técnica para un juego de carreras arcade móvil">
        🏁 Little Grand Prix
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Visión del Producto</h3>
        <p className="text-gray-300 leading-relaxed">
          Un juego de carreras arcade para navegador móvil inspirado en la experiencia táctil de Mario Kart Tour.
          El jugador controla un kart en un circuito cerrado con rivales IA, recoge monedas y usa objetos,
          todo mediante controles táctiles intuitivos. Diseñado para desarrollo individual en 2–4 semanas.
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-green-300 mb-3">✅ Incluye en MVP</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Carrera completa en circuito cerrado</li>
            <li>• Control táctil del kart (acelerar, girar, derrapar)</li>
            <li>• Límites de pista y colisiones</li>
            <li>• Detección de vueltas con cronómetro</li>
            <li>• 2–3 rivales IA</li>
            <li>• Monedas y 1–3 objetos utilizables</li>
            <li>• Posiciones en tiempo real</li>
            <li>• Pantalla de resultados</li>
            <li>• Menú, pausa, reinicio</li>
            <li>• Selección de vehículo</li>
            <li>• Récord local (localStorage)</li>
            <li>• UI responsive para móvil</li>
          </ul>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-red-300 mb-3">❌ No incluye en MVP</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Cuentas de usuario</li>
            <li>• Tienda / monetización</li>
            <li>• Backend / base de datos</li>
            <li>• Multijugador en línea</li>
            <li>• Múltiples circuitos</li>
            <li>• Personalización profunda</li>
            <li>• Logros / ranking global</li>
            <li>• Marketing / analytics</li>
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">🎯 Criterios de Aceptación del MVP</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="space-y-2">
            <p>✅ El jugador puede completar una carrera de 3 vueltas</p>
            <p>✅ Los controles táctiles responden en &lt;100ms</p>
            <p>✅ El juego corre a 30+ FPS en móvil gama media</p>
            <p>✅ Los rivales IA completan el circuito sin bugs</p>
            <p>✅ Las colisiones con bordes son consistentes</p>
          </div>
          <div className="space-y-2">
            <p>✅ Los objetos tienen efecto observable</p>
            <p>✅ El cronómetro y posiciones son precisos</p>
            <p>✅ El récord se persiste entre sesiones</p>
            <p>✅ La UI es legible en pantallas de 320px+</p>
            <p>✅ No hay crashes en sesión de 10 min</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-purple-300 mb-3">📐 Evaluación del Stack</h3>
        <p className="text-gray-300 text-sm mb-3">
          El stack propuesto es <strong className="text-green-400">adecuado y suficiente</strong> para el MVP. Justificación:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-4 text-gray-400">Tecnología</th>
                <th className="py-2 pr-4 text-gray-400">Rol</th>
                <th className="py-2 text-gray-400">Evaluación</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800"><td className="py-2 pr-4 font-mono text-blue-300">React</td><td className="py-2 pr-4">Menús, HUD, pantallas UI</td><td className="py-2"><Badge color="green">Óptimo</Badge></td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4 font-mono text-blue-300">TypeScript strict</td><td className="py-2 pr-4">Tipado de entidades, eventos, estados</td><td className="py-2"><Badge color="green">Óptimo</Badge></td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4 font-mono text-blue-300">Vite</td><td className="py-2 pr-4">Build rápido, HMR, tree-shaking</td><td className="py-2"><Badge color="green">Óptimo</Badge></td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4 font-mono text-blue-300">Phaser 3</td><td className="py-2 pr-4">Motor de juego: física, sprites, audio</td><td className="py-2"><Badge color="green">Óptimo</Badge></td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4 font-mono text-blue-300">Tailwind CSS</td><td className="py-2 pr-4">Estilos de UI sobre el canvas</td><td className="py-2"><Badge color="green">Óptimo</Badge></td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4 font-mono text-blue-300">Vitest</td><td className="py-2 pr-4">Tests unitarios de lógica de juego</td><td className="py-2"><Badge color="green">Óptimo</Badge></td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4 font-mono text-blue-300">localStorage</td><td className="py-2 pr-4">Récords, preferencias</td><td className="py-2"><Badge color="green">Óptimo</Badge></td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-400 text-xs mt-3">
          <strong>Dependencias adicionales necesarias:</strong> Ninguna estrictamente obligatoria. Opcionalmente:
          <code className="text-cyan-300"> howler.js</code> (si Phaser audio no basta),
          <code className="text-cyan-300"> zustand</code> (estado global React),
          <code className="text-cyan-300"> @react-three/fiber</code> (solo si se opta por pseudo-3D).
        </p>
      </Card>
    </div>
  );
}

/* ---- 1. ARCHITECTURE ---- */
function ArchitectureSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Diseño de la arquitectura de software y justificación de decisiones">
        🏗️ 1. Arquitectura Propuesta
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Patrón: React Shell + Phaser Core</h3>
        <p className="text-gray-300 text-sm mb-4">
          La aplicación usa un patrón de <strong>doble capa</strong>: React gestiona toda la interfaz de usuario
          (menús, HUD, pantallas de resultado) mientras Phaser 3 se ejecuta dentro de un <code className="text-cyan-300">&lt;canvas&gt;</code> embebido,
          manejando exclusivamente la lógica del juego (física, sprites, colisiones, audio).
        </p>
        <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto">
          <pre>{`┌─────────────────────────────────────────────┐
│                 React Shell                  │
│  ┌─────────┐ ┌──────┐ ┌──────────────────┐ │
│  │  Menú   │ │ HUD  │ │  Result Screen   │ │
│  └────┬────┘ └──┬───┘ └────────┬─────────┘ │
│       │         │              │            │
│  ┌────▼─────────▼──────────────▼─────────┐  │
│  │        Game Bridge (EventBus)          │  │
│  │  React ←→ Phaser bidirectional comm   │  │
│  └────────────────┬──────────────────────┘  │
│                   │                          │
│  ┌────────────────▼──────────────────────┐  │
│  │           Phaser 3 Game Core           │  │
│  │  ┌─────────┐ ┌──────┐ ┌───────────┐  │  │
│  │  │  Scene  │ │Physics│ │  Audio    │  │  │
│  │  │ Manager │ │Engine │ │  Manager  │  │  │
│  │  └─────────┘ └──────┘ └───────────┘  │  │
│  │  ┌─────────┐ ┌──────┐ ┌───────────┐  │  │
│  │  │  Input  │ │ AI   │ │  Camera   │  │  │
│  │  │ Manager │ │System│ │  System   │  │  │
│  │  └─────────┘ └──────┘ └───────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘`}</pre>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-green-300 mb-3">Justificación Arquitectónica</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-white">¿Por qué React + Phaser y no solo Phaser?</p>
            <p className="text-gray-400">React ofrece un sistema de UI maduro para menús complejos, transiciones y estado de aplicación. Phaser se enfoca en el renderizado del juego. Separar responsabilidades permite iterar en UI sin tocar el motor.</p>
          </div>
          <div>
            <p className="font-semibold text-white">¿Por qué un EventBus como puente?</p>
            <p className="text-gray-400">Desacopla React de Phaser. El HUD escucha eventos de Phaser (posición, velocidad, vueltas) sin conocer la implementación interna. Phaser recibe comandos de React (pausar, reiniciar) sin saber de React.</p>
          </div>
          <div>
            <p className="font-semibold text-white">¿Por qué ECS-lite en Phaser?</p>
            <p className="text-gray-400">Phaser 3 soporta componentes nativamente. Usar su sistema de GameObjects + custom components permite reutilizar lógica entre karts, rivales e items sin herencia profunda.</p>
          </div>
          <div>
            <p className="font-semibold text-white">¿Por qué localStorage y no IndexedDB?</p>
            <p className="text-gray-400">Para un MVP con récords simples y preferencias, localStorage es suficiente (5MB). IndexedDB sería over-engineering. Se puede migrar después si crecen los datos.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Comunicación React ↔ Phaser</h3>
        <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto">
          <pre>{`// EventBus tipado
type GameEvents = {
  'race:lap': { lap: number; time: number };
  'race:position': { positions: KartState[] };
  'race:finish': { results: RaceResult };
  'race:coin': { total: number };
  'race:item': { item: ItemType };
  'game:pause': void;
  'game:resume': void;
  'game:restart': void;
};

// React envía comandos
gameBridge.emit('game:pause');

// Phaser emite estado
gameBridge.emit('race:position', { positions: [...] });

// React escucha y actualiza HUD
gameBridge.on('race:position', (data) => setPositions(data.positions));`}</pre>
        </div>
      </Card>
    </div>
  );
}

/* ---- 2. DIRECTORY ---- */
function DirectorySection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Organización del código fuente y assets">
        📁 2. Estructura de Directorios
      </SectionTitle>

      <Card>
        <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto">
          <pre>{`little-grand-prix/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
│
├── public/
│   ├── favicon.ico
│   ├── audio/
│   │   ├── sfx/              # Efectos de sonido (OGG + MP3)
│   │   │   ├── engine-loop.ogg
│   │   │   ├── coin.ogg
│   │   │   ├── drift.ogg
│   │   │   ├── item-use.ogg
│   │   │   └── countdown.ogg
│   │   └── music/
│   │       └── race-theme.ogg
│   └── images/
│       ├── sprites/           # Sprites de karts, items, efectos
│       ├── tiles/             # Tiles de circuito
│       └── ui/                # Iconos de HUD, botones
│
├── src/
│   ├── main.tsx               # Entry point React
│   ├── App.tsx                # Router de pantallas
│   ├── index.css              # Tailwind imports
│   │
│   ├── react/                 # Capa React (UI)
│   │   ├── components/
│   │   │   ├── GameCanvas.tsx       # Contenedor del canvas Phaser
│   │   │   ├── HUD.tsx              # Velocidad, posición, vueltas
│   │   │   ├── MiniMap.tsx          # Minimapa del circuito
│   │   │   ├── TouchControls.tsx    # Overlay de controles táctiles
│   │   │   ├── ItemSlot.tsx         # Slot de item actual
│   │   │   ├── Countdown.tsx        # 3-2-1-GO overlay
│   │   │   └── ResultsScreen.tsx    # Pantalla de resultados
│   │   ├── screens/
│   │   │   ├── MainMenu.tsx         # Menú principal
│   │   │   ├── VehicleSelect.tsx    # Selección de kart
│   │   │   ├── RaceScreen.tsx       # Pantalla de carrera completa
│   │   │   └── PauseMenu.tsx        # Menú de pausa
│   │   └── hooks/
│   │       ├── useGameBridge.ts     # Hook para comunicar con Phaser
│   │       ├── useRaceState.ts      # Estado de carrera
│   │       └── useLocalStorage.ts   # Persistencia
│   │
│   ├── game/                  # Capa Phaser (lógica de juego)
│   │   ├── config.ts               # Phaser.Game config
│   │   ├── scenes/
│   │   │   ├── BootScene.ts        # Carga de assets
│   │   │   ├── RaceScene.ts        # Escena principal de carrera
│   │   │   └── ResultScene.ts      # Escena de resultados
│   │   ├── entities/
│   │   │   ├── Kart.ts             # Entidad kart (jugador + IA)
│   │   │   ├── Coin.ts             # Moneda coleccionable
│   │   │   ├── ItemBox.ts          # Caja de items
│   │   │   ├── Projectile.ts       # Objetos lanzados
│   │   │   └── TrackBoundary.ts    # Límites de pista
│   │   ├── systems/
│   │   │   ├── MovementSystem.ts   # Aceleración, giro, derrape
│   │   │   ├── CollisionSystem.ts  # Detección y respuesta
│   │   │   ├── LapSystem.ts        # Conteo de vueltas
│   │   │   ├── ItemSystem.ts       # Lógica de items
│   │   │   ├── AISystem.ts         # Comportamiento de rivales
│   │   │   ├── CameraSystem.ts     # Seguimiento de cámara
│   │   │   └── PositionSystem.ts   # Cálculo de posiciones
│   │   ├── tracks/
│   │   │   ├── TrackData.ts        # Definición de circuitos
│   │   │   └── CircuitOne.ts       # Circuito MVP
│   │   ├── physics/
│   │   │   ├── ArcadePhysics.ts    # Wrapper de física arcade
│   │   │   └── TrackCollider.ts    # Colisiones con pista
│   │   └── bridge/
│   │       └── GameBridge.ts       # EventBus Phaser→React
│   │
│   ├── core/                  # Lógica compartida/agóstica
│   │   ├── types.ts                # Tipos del dominio
│   │   ├── constants.ts            # Constantes del juego
│   │   ├── EventBus.ts             # Implementación del EventBus
│   │   └── storage.ts              # Wrapper localStorage
│   │
│   └── __tests__/             # Tests unitarios
│       ├── systems/
│       │   ├── MovementSystem.test.ts
│       │   ├── LapSystem.test.ts
│       │   ├── AISystem.test.ts
│       │   └── PositionSystem.test.ts
│       ├── entities/
│       │   └── Kart.test.ts
│       └── core/
│           └── EventBus.test.ts
│
└── docs/
    ├── plan-tecnico.md
    └── assets-license.md`}</pre>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Principios de Organización</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-white mb-1">Separación de capas</p>
            <p className="text-gray-400"><code>src/react/</code> y <code>src/game/</code> son independientes. Solo se comunican vía <code>GameBridge</code>.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Sistemas, no herencia</p>
            <p className="text-gray-400">La lógica de juego vive en <code>systems/</code>, no en métodos de entidades. Facilita testing y balanceo.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Tipos centralizados</p>
            <p className="text-gray-400"><code>core/types.ts</code> define interfaces compartidas entre React y Phaser sin dependencias circulares.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Assets organizados por tipo</p>
            <p className="text-gray-400"><code>public/audio/</code> y <code>public/images/</code> separados para carga eficiente y cacheo.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---- 3. ENTITIES ---- */
function EntitiesSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Modelo de entidades, componentes y sistemas del juego">
        🎮 3. Entidades y Sistemas
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Entidades Principales</h3>
        <div className="space-y-4">
          <div className="bg-gray-950 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏎️</span>
              <h4 className="font-semibold text-white">Kart</h4>
              <Badge color="green">Entidad central</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-300">
              <div>
                <p className="text-gray-500 mb-1">Propiedades:</p>
                <ul className="space-y-0.5">
                  <li>• position: Vector2</li>
                  <li>• velocity: Vector2</li>
                  <li>• angle: number (radianes)</li>
                  <li>• speed: number (actual)</li>
                  <li>• maxSpeed: number (según vehículo)</li>
                  <li>• acceleration: number</li>
                  <li>• turnRate: number</li>
                  <li>• isDrifting: boolean</li>
                  <li>• driftDirection: -1 | 0 | 1</li>
                  <li>• driftCharge: number (0-100)</li>
                  <li>• currentLap: number</li>
                  <li>• lastCheckpoint: number</li>
                  <li>• coins: number</li>
                  <li>• heldItem: ItemType | null</li>
                  <li>• isPlayer: boolean</li>
                </ul>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Comportamientos:</p>
                <ul className="space-y-0.5">
                  <li>• accelerate(force)</li>
                  <li>• steer(direction)</li>
                  <li>• startDrift(direction)</li>
                  <li>• endDrift() → miniTurbo?</li>
                  <li>• applyItem(item)</li>
                  <li>• takeHit()</li>
                  <li>• respawn()</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-950 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🪙</span>
              <h4 className="font-semibold text-white">Coin</h4>
              <Badge color="yellow">Coleccionable</Badge>
            </div>
            <p className="text-xs text-gray-300">position, collected, respawnTimer. Al recoger: +1 moneda, boost mínimo de velocidad.</p>
          </div>

          <div className="bg-gray-950 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📦</span>
              <h4 className="font-semibold text-white">ItemBox</h4>
              <Badge color="purple">Interactuable</Badge>
            </div>
            <p className="text-xs text-gray-300">position, isActive, respawnTimer. Al pasar por encima: asigna item aleatorio al kart.</p>
          </div>

          <div className="bg-gray-950 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💣</span>
              <h4 className="font-semibold text-white">Projectile / Effect</h4>
              <Badge color="red">Efecto</Badge>
            </div>
            <p className="text-xs text-gray-300">Tipos: caparazón (persigue), plátano (trampa estática), turbo (boost propio). Cada uno con lifetime, collider y efecto.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-green-300 mb-3">Sistemas del Juego</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-4 text-gray-400">Sistema</th>
                <th className="py-2 pr-4 text-gray-400">Responsabilidad</th>
                <th className="py-2 pr-4 text-gray-400">Frecuencia</th>
                <th className="py-2 text-gray-400">Prioridad</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs text-cyan-300">MovementSystem</td>
                <td className="py-2 pr-4">Aplica aceleración, giro, fricción y derrape a cada kart</td>
                <td className="py-2 pr-4">Cada frame</td>
                <td className="py-2"><Badge color="red">Crítico</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs text-cyan-300">CollisionSystem</td>
                <td className="py-2 pr-4">Detecta kart-borde, kart-kart, kart-item, kart-coin</td>
                <td className="py-2 pr-4">Cada frame</td>
                <td className="py-2"><Badge color="red">Crítico</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs text-cyan-300">LapSystem</td>
                <td className="py-2 pr-4">Detecta cruces de checkpoints y línea de meta</td>
                <td className="py-2 pr-4">Por evento</td>
                <td className="py-2"><Badge color="red">Crítico</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs text-cyan-300">AISystem</td>
                <td className="py-2 pr-4">Controla karts no-jugador: sigue waypoints, evita bordes</td>
                <td className="py-2 pr-4">Cada frame</td>
                <td className="py-2"><Badge color="yellow">Alta</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs text-cyan-300">ItemSystem</td>
                <td className="py-2 pr-4">Gestiona recogida, uso y efectos de items</td>
                <td className="py-2 pr-4">Por evento</td>
                <td className="py-2"><Badge color="yellow">Alta</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs text-cyan-300">PositionSystem</td>
                <td className="py-2 pr-4">Calcula orden de carrera (checkpoint + progreso entre checkpoints)</td>
                <td className="py-2 pr-4">Cada 500ms</td>
                <td className="py-2"><Badge color="blue">Media</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-xs text-cyan-300">CameraSystem</td>
                <td className="py-2 pr-4">Sigue al jugador con interpolación suave y lookahead</td>
                <td className="py-2 pr-4">Cada frame</td>
                <td className="py-2"><Badge color="blue">Media</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-purple-300 mb-3">Diagrama de Flujo de Sistemas (por frame)</h3>
        <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto">
          <pre>{`Frame Loop (60 FPS target):
  1. InputSystem.poll()         → lee touch state
  2. AISystem.update()          → decide inputs de rivales
  3. MovementSystem.update()    → aplica física a todos los karts
  4. CollisionSystem.update()   → detecta y resuelve colisiones
  5. LapSystem.update()         → verifica checkpoints
  6. ItemSystem.update()        → actualiza projectiles/effects
  7. PositionSystem.update()    → recalcula posiciones (throttled)
  8. CameraSystem.update()      → mueve cámara
  9. Bridge.emit()              → envía estado a React HUD`}</pre>
        </div>
      </Card>
    </div>
  );
}

/* ---- 4. MOVEMENT ---- */
function MovementSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Física de movimiento, diseño de circuitos, colisiones y detección de vueltas">
        🏎️ 4. Movimiento, Circuitos y Colisiones
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Modelo de Movimiento Arcade</h3>
        <p className="text-sm text-gray-300 mb-4">
          Se usa un modelo de física simplificado tipo "arcade" (no simulación realista). El kart se mueve
          en un espacio 2D con rotación libre, sin inercia lateral excesiva.
        </p>
        <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto">
          <pre>{`// MovementSystem.update(kart, input, dt)

// 1. Aceleración
if (input.accelerating) {
  kart.speed += kart.acceleration * dt;
} else {
  kart.speed *= (1 - FRICTION * dt);  // FRICTION = 0.98
}
kart.speed = clamp(kart.speed, -MAX_REVERSE, kart.maxSpeed);

// 2. Dirección (giro proporcional a velocidad)
const turnFactor = kart.speed / kart.maxSpeed;
const effectiveTurn = kart.turnRate * turnFactor * dt;
kart.angle += input.steerDirection * effectiveTurn;

// 3. Derrape (drift)
if (input.drifting && Math.abs(input.steerDirection) > 0) {
  kart.isDrifting = true;
  kart.driftCharge += dt * DRIFT_CHARGE_RATE;
  // Ángulo del kart se separa ligeramente de la dirección de movimiento
  kart.visualAngle = kart.angle + kart.driftDirection * DRIFT_SLIDE_ANGLE;
} else if (kart.isDrifting) {
  // Mini-turbo al soltar drift
  const boostLevel = getBoostLevel(kart.driftCharge); // 1, 2 o 3
  kart.speed += boostLevel * MINI_TURBO_BOOST;
  kart.isDrifting = false;
  kart.driftCharge = 0;
}

// 4. Aplicar velocidad como vector
kart.velocity.x = Math.cos(kart.angle) * kart.speed;
kart.velocity.y = Math.sin(kart.angle) * kart.speed;
kart.position.add(kart.velocity);`}</pre>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-green-300 mb-3">Diseño del Circuito</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-white mb-2">Estructura del Track</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Definido como un conjunto de <strong>waypoints</strong> ordenados</li>
              <li>• Cada waypoint tiene: posición, ancho de pista, tipo de superficie</li>
              <li>• Los bordes se interpolan entre waypoints (curvas suaves)</li>
              <li>• La línea de meta es el segmento entre waypoint[0] y waypoint[1]</li>
              <li>• Checkpoints intermedios cada N waypoints</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-2">Circuito MVP (CircuitOne)</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Forma: óvalo con 2 curvas cerradas y 1 chicana</li>
              <li>• Longitud: ~800px de perímetro (en coordenadas de mundo)</li>
              <li>• Ancho de pista: 80–120px variable</li>
              <li>• 6 checkpoints + línea de meta</li>
              <li>• 3 cajas de items distribuidas</li>
              <li>• 8–12 monedas en posiciones estratégicas</li>
              <li>• 1 atajo opcional (más estrecho, con riesgo)</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Estrategia de Colisiones</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-white">Kart vs Bordes de Pista</p>
            <p className="text-gray-400 text-xs">Se definen los bordes como polígonos. Phaser Arcade Physics usa cuerpos rectangulares/circulares. Para los bordes se crean múltiples bodies estáticos alineados a lo largo del track. Al colisionar: el kart se desliza a lo largo del borde (no rebote fuerte) y pierde 30% de velocidad.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Kart vs Kart</p>
            <p className="text-gray-400 text-xs">Cuerpos circulares. Al colisionar: se empujan mutuamente (transferencia de momentum simplificada). El kart más rápido pierde menos velocidad. Si un kart está en estado "star" o "boost", el otro sale volando.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Kart vs Objetos</p>
            <p className="text-gray-400 text-xs">Overlap simple con Phaser. Monedas: recoger + sonido + respawn. ItemBox: asignar item + animación. Projectiles: aplicar efecto al impactar.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Fuera de Pista</p>
            <p className="text-gray-400 text-xs">Si el kart cruza el borde exterior más de X píxeles, se considera "off-track": velocidad reducida al 40% y se aplica fuerza de retorno hacia el centro de la pista más cercano.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-purple-300 mb-3">Detección de Vueltas</h3>
        <div className="bg-gray-950 rounded-lg p-4 text-xs text-gray-300">
          <p className="mb-2"><strong className="text-white">Algoritmo de checkpoints secuenciales:</strong></p>
          <pre className="overflow-x-auto">{`1. El circuito tiene N checkpoints (C0, C1, ..., Cn-1) + línea de meta (F)
2. Cada kart registra: lastCheckpoint (índice)
3. Cuando un kart toca Ci:
   - Si i === (lastCheckpoint + 1) % N → válido, actualizar lastCheckpoint
   - Si i === 0 (meta) Y lastCheckpoint === N-1 → ¡vuelta completada!
   - Si i === 0 Y currentLap === 0 → inicio de carrera, no cuenta
   - En otro caso → ignorar (evita hacer trampa yendo en reversa)
4. Al completar vuelta N (ej: 3): carrera terminada para ese kart
5. Se registra tiempo de cada vuelta para resultados`}</pre>
        </div>
      </Card>
    </div>
  );
}

/* ---- 5. CONTROLS ---- */
function ControlsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Diseño de controles táctiles y optimización para rendimiento móvil">
        👆 5. Controles Táctiles y Rendimiento
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Layout de Controles Táctiles</h3>
        <div className="bg-gray-950 rounded-lg p-4 text-xs text-gray-300 mb-4">
          <pre className="overflow-x-auto">{`┌─────────────────────────────────┐
│  [PAUSE]              [MINIMAP] │  ← HUD superior
│                                 │
│                                 │
│           GAME VIEW             │
│        (canvas Phaser)          │
│                                 │
│                                 │
│  ┌──────┐            ┌───────┐  │
│  │ ← →  │            │  A    │  │  ← Controles inferiores
│  │DIR   │            │  CCEL │  │
│  └──────┘            └───────┘  │
│                                 │
│              [DRIFT]            │  ← Botón central inferior
│              [SPACE]            │
│              [ITEM]             │  ← Usar item (si tiene)
└─────────────────────────────────┘`}</pre>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-300">
          <div className="bg-gray-950 rounded p-3">
            <p className="font-semibold text-white text-xs mb-1">Zona Izquierda: Dirección</p>
            <p className="text-xs text-gray-400">Pad virtual o botones ←/→. Se mantiene presionado para girar continuo. Sensibilidad proporcional a la posición dentro de la zona.</p>
          </div>
          <div className="bg-gray-950 rounded p-3">
            <p className="font-semibold text-white text-xs mb-1">Zona Derecha: Acelerar</p>
            <p className="text-xs text-gray-400">Botón grande "A". Se mantiene presionado para acelerar. Al soltar: frenado natural. Área grande para pulgar.</p>
          </div>
          <div className="bg-gray-950 rounded p-3">
            <p className="font-semibold text-white text-xs mb-1">Zona Central: Drift + Item</p>
            <p className="text-xs text-gray-400">Botón "Drift" (se activa mientras se gira). Botón "Item" aparece solo si se tiene un item. Tap para usar.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-green-300 mb-3">Implementación Técnica de Inputs</h3>
        <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto">
          <pre>{`// Opción A: HTML overlay (recomendada para MVP)
// Los controles son divs de React sobre el canvas
// Ventaja: fácil de estilizar, accesibles, sin tocar Phaser input

<div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none">
  <button
    className="pointer-events-auto absolute left-4 bottom-4 w-20 h-20"
    onTouchStart={() => input.setSteer(-1)}
    onTouchEnd={() => input.setSteer(0)}
  >←</button>
  {/* ... */}
</div>

// Opción B: Phaser Input (alternativa)
// Phaser tiene soporte táctil nativo
// this.input.on('pointerdown', handleTouch);
// Desventaja: menos control sobre layout responsive

// Estado de input compartido
interface TouchInput {
  steer: -1 | 0 | 1;
  accelerating: boolean;
  drifting: boolean;
  useItem: boolean;  // edge-triggered
}`}</pre>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Estrategia de Rendimiento Móvil</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-gray-950 rounded p-3">
              <p className="font-semibold text-white text-xs mb-1">🎯 Target: 30 FPS estables</p>
              <p className="text-xs text-gray-400">En móvil gama media (2-3 años). 60 FPS como aspiracional en gama alta. Phaser permite configurar FPS target.</p>
            </div>
            <div className="bg-gray-950 rounded p-3">
              <p className="font-semibold text-white text-xs mb-1">🖼️ Sprites optimizados</p>
              <p className="text-xs text-gray-400">SpriteSheets con atlas. Texturas en múltiplos de 2. Máximo 512x512 por atlas. Usar Phaser Texture Packer.</p>
            </div>
            <div className="bg-gray-950 rounded p-3">
              <p className="font-semibold text-white text-xs mb-1">📐 Resolución adaptativa</p>
              <p className="text-xs text-gray-400">Canvas interno a resolución fija (ej: 480x800) escalado con CSS. devicePixelRatio capped a 2. Evita renderizar en resolución nativa del móvil.</p>
            </div>
            <div className="bg-gray-950 rounded p-3">
              <p className="font-semibold text-white text-xs mb-1">🔄 Object Pooling</p>
              <p className="text-xs text-gray-400">Monedas, projectiles y efectos usan pools. Nunca crear/destruir GameObjects en runtime. Reutilizar instancias.</p>
            </div>
            <div className="bg-gray-950 rounded p-3">
              <p className="font-semibold text-white text-xs mb-1">⚡ Throttling de HUD</p>
              <p className="text-xs text-gray-400">React re-renderiza HUD cada 100-200ms, no cada frame. Los datos del juego se actualizan en un ref, no en state.</p>
            </div>
            <div className="bg-gray-950 rounded p-3">
              <p className="font-semibold text-white text-xs mb-1">🔊 Audio comprimido</p>
              <p className="text-xs text-gray-400">OGG para Chrome/Firefox, MP3 fallback para Safari. 44.1kHz → 22kHz para SFX. Music a 128kbps máximo.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-purple-300 mb-3">Consideraciones Mobile-First</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• <strong>Viewport lock:</strong> <code className="text-cyan-300">user-scalable=no, maximum-scale=1</code> para evitar zoom accidental</li>
          <li>• <strong>Orientación:</strong> Forzar vertical (portrait) o soportar ambas. MVP: portrait para simplicidad</li>
          <li>• <strong>Touch events:</strong> Usar <code className="text-cyan-300">touchstart/touchend</code> con <code className="text-cyan-300">passive: true</code> para evitar scroll</li>
          <li>• <strong>Safe areas:</strong> Respetar <code className="text-cyan-300">env(safe-area-inset-*)</code> para notch/bottom bar</li>
          <li>• <strong>Wake Lock:</strong> Usar Screen Wake Lock API para evitar que la pantalla se apague</li>
          <li>• <strong>Audio context:</strong> Desbloquear AudioContext en primer toque (requisito de iOS)</li>
        </ul>
      </Card>
    </div>
  );
}

/* ---- 6. TESTING ---- */
function TestingSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Estrategia de pruebas unitarias, de integración y manuales">
        🧪 6. Plan de Pruebas
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Pirámide de Tests</h3>
        <div className="bg-gray-950 rounded-lg p-6 text-center">
          <div className="inline-block">
            <div className="bg-red-900/30 border border-red-700 rounded-t-lg px-8 py-2 mb-1 text-xs text-red-300">
              E2E / Manual (10%)
            </div>
            <div className="bg-yellow-900/30 border border-yellow-700 px-16 py-2 mb-1 text-xs text-yellow-300">
              Integración (20%)
            </div>
            <div className="bg-green-900/30 border border-green-700 rounded-b-lg px-24 py-3 text-xs text-green-300">
              Unitarias (70%) — Vitest
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-green-300 mb-3">Tests Unitarios (Vitest)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-4 text-gray-400">Módulo</th>
                <th className="py-2 pr-4 text-gray-400">Qué se testea</th>
                <th className="py-2 text-gray-400">Casos clave</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-cyan-300">MovementSystem</td>
                <td className="py-2 pr-4">Aceleración, frenado, giro, derrape</td>
                <td className="py-2">speed no excede maxSpeed; drift charge acumula; mini-turbo aplica boost</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-cyan-300">LapSystem</td>
                <td className="py-2 pr-4">Conteo de vueltas y checkpoints</td>
                <td className="py-2">No cuenta vuelta si no pasa por todos los checkpoints; no permite ir en reversa</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-cyan-300">PositionSystem</td>
                <td className="py-2 pr-4">Orden de carrera</td>
                <td className="py-2">Kart con más vueltas va primero; desempate por checkpoint más avanzado</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-cyan-300">AISystem</td>
                <td className="py-2 pr-4">Navegación de waypoints</td>
                <td className="py-2">IA avanza hacia siguiente waypoint; respeta límites de velocidad</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-cyan-300">ItemSystem</td>
                <td className="py-2 pr-4">Asignación y uso de items</td>
                <td className="py-2">No puede tener 2 items; usar item lo consume; efectos aplicados correctamente</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-cyan-300">EventBus</td>
                <td className="py-2 pr-4">Emisión y escucha de eventos</td>
                <td className="py-2">Listeners reciben datos correctos; unsubscribe funciona; sin memory leaks</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono text-cyan-300">storage</td>
                <td className="py-2 pr-4">Persistencia de récords</td>
                <td className="py-2">Guarda y lee récords; maneja datos corruptos gracefully</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Tests de Integración</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>✅ <strong>GameBridge:</strong> Verificar que Phaser emite eventos y React los recibe correctamente</li>
          <li>✅ <strong>Escena completa:</strong> Simular una carrera de 1 vuelta con karts IA y verificar que LapSystem detecta el final</li>
          <li>✅ <strong>Colisiones:</strong> Verificar que kart contra borde reduce velocidad correctamente</li>
          <li>✅ <strong>Item + Kart:</strong> Usar un caparazón y verificar que el kart impactado se detiene</li>
        </ul>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-purple-300 mb-3">Tests Manuales (Checklist)</h3>
        <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-300">
          <div className="space-y-1">
            <p>☐ Carrera completa sin crashes (Chrome Android)</p>
            <p>☐ Carrera completa sin crashes (Safari iOS)</p>
            <p>☐ Controles responden correctamente al tacto</p>
            <p>☐ Derrape + mini-turbo funciona</p>
            <p>☐ IA no se atasca en curvas</p>
            <p>☐ Monedas se recogen y cuentan</p>
          </div>
          <div className="space-y-1">
            <p>☐ Items se obtienen y usan correctamente</p>
            <p>☐ Cronómetro es preciso (comparar con stopwatch)</p>
            <p>☐ Posiciones se actualizan en tiempo real</p>
            <p>☐ Pausa/reinicio funciona desde menú</p>
            <p>☐ Récord se guarda y persiste al recargar</p>
            <p>☐ FPS &gt; 25 en móvil gama media</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---- 7. DEPLOY ---- */
function DeploySection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Estrategia de despliegue web y hosting">
        🚀 7. Plan de Despliegue
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-3">Opciones de Hosting (gratuitas)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-4 text-gray-400">Plataforma</th>
                <th className="py-2 pr-4 text-gray-400">Ventajas</th>
                <th className="py-2 pr-4 text-gray-400">Desventajas</th>
                <th className="py-2 text-gray-400">Recomendación</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 text-xs">
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-semibold text-white">Vercel</td>
                <td className="py-2 pr-4">Deploy desde Git, CDN global, preview branches</td>
                <td className="py-2 pr-4">Serverless functions (no necesarias aquí)</td>
                <td className="py-2"><Badge color="green">⭐ Recomendado</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-semibold text-white">Netlify</td>
                <td className="py-2 pr-4">Similar a Vercel, forms/redirects incluidos</td>
                <td className="py-2 pr-4">Build minutes limitados en free tier</td>
                <td className="py-2"><Badge color="blue">Alternativa</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-semibold text-white">GitHub Pages</td>
                <td className="py-2 pr-4">Gratis ilimitado, integrado con repo</td>
                <td className="py-2 pr-4">Sin preview branches, SPA routing manual</td>
                <td className="py-2"><Badge color="gray">Válido</Badge></td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-semibold text-white">Cloudflare Pages</td>
                <td className="py-2 pr-4">CDN excelente, bandwidth ilimitado</td>
                <td className="py-2 pr-4">Menos ecosystem que Vercel</td>
                <td className="py-2"><Badge color="blue">Alternativa</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-green-300 mb-3">Pipeline de Deploy</h3>
        <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto">
          <pre>{`Desarrollo local:
  npm run dev          → Vite HMR en localhost:5173
  npm run test         → Vitest watch mode
  npm run build        → Build de producción local

CI/CD (GitHub Actions o automático en Vercel):
  push a main → npm run build → deploy a producción
  push a PR   → npm run build → preview URL
  
Comandos:
  npm run dev          # Desarrollo con HMR
  npm run build        # Build producción (Vite)
  npm run preview      # Preview del build local
  npm run test         # Tests unitarios (Vitest)
  npm run test:coverage # Coverage report
  npm run lint         # ESLint (opcional)`}</pre>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Consideraciones PWA (opcional post-MVP)</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• <strong>Manifest.json:</strong> Nombre, iconos, orientation: portrait, display: standalone</li>
          <li>• <strong>Service Worker:</strong> Cache de assets para jugar offline (post-MVP)</li>
          <li>• <strong>Install prompt:</strong> "Añadir a pantalla de inicio" para experiencia app-like</li>
          <li>• <strong>Iconos:</strong> 192x192 y 512x512 PNG para home screen</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">Nota: PWA no es requisito del MVP pero es una mejora natural posterior.</p>
      </Card>
    </div>
  );
}

/* ---- 8. TIMELINE ---- */
function TimelineSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Cronograma de 4 semanas con hitos verificables">
        📅 8. Cronograma
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-indigo-300 mb-4">Semana 1: Fundamentos</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="green">D1-2</Badge>
            <div>
              <p className="text-white font-medium">Setup del proyecto</p>
              <p className="text-gray-400 text-xs">Vite + React + TS + Phaser + Tailwind. Estructura de directorios. Configurar Vitest. Primer "Hello World" de Phaser en canvas.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Phaser renderiza un sprite en el navegador</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="green">D3-4</Badge>
            <div>
              <p className="text-white font-medium">Movimiento del kart</p>
              <p className="text-gray-400 text-xs">MovementSystem implementado. Kart se mueve con teclado (temporal). Aceleración, giro, fricción. Tests unitarios de movimiento.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Kart se mueve suavemente con inputs de teclado</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="green">D5-7</Badge>
            <div>
              <p className="text-white font-medium">Circuito y colisiones</p>
              <p className="text-gray-400 text-xs">Diseño del track con waypoints. Renderizado del circuito. Colisión con bordes. Cámara siguiendo al kart.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Kart circula por el circuito sin salirse</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-yellow-300 mb-4">Semana 2: Mecánicas de Carrera</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="yellow">D8-9</Badge>
            <div>
              <p className="text-white font-medium">Derrape y mini-turbo</p>
              <p className="text-gray-400 text-xs">Sistema de drift completo. Carga de boost, niveles de mini-turbo, efecto visual de chispas.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Drift funcional con boost al soltar</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="yellow">D10-11</Badge>
            <div>
              <p className="text-white font-medium">Sistema de vueltas y posiciones</p>
              <p className="text-gray-400 text-xs">Checkpoints, LapSystem, PositionSystem. Cronómetro. HUD básico en React mostrando posición y vuelta.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Se puede completar 3 vueltas y se muestra resultado</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="yellow">D12-14</Badge>
            <div>
              <p className="text-white font-medium">Rivales IA</p>
              <p className="text-gray-400 text-xs">AISystem con waypoints. 2-3 rivales que completan el circuito. Velocidad variable para que la carrera sea competitiva. Colisiones kart-kart.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Carrera completa con 3 rivales IA sin bugs</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-blue-300 mb-4">Semana 3: Items, UI y Controles</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="blue">D15-16</Badge>
            <div>
              <p className="text-white font-medium">Monedas e Items</p>
              <p className="text-gray-400 text-xs">Monedas en el circuito. Cajas de items. 2-3 tipos de items: boost, caparazón, plátano. ItemSystem completo.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Items se recogen, guardan y usan con efecto</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="blue">D17-18</Badge>
            <div>
              <p className="text-white font-medium">Controles táctiles</p>
              <p className="text-gray-400 text-xs">TouchControls en React. Botones de dirección, acelerador, drift, item. Ajustar sensibilidad. Probar en móvil real.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Juego completamente jugable en móvil táctil</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="blue">D19-21</Badge>
            <div>
              <p className="text-white font-medium">Menús y pantallas</p>
              <p className="text-gray-400 text-xs">MainMenu, VehicleSelect, PauseMenu, ResultsScreen. Countdown 3-2-1-GO. Transiciones entre pantallas. GameBridge completo.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Flujo completo menú → selección → carrera → resultados</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Semana 4: Polish, Audio y Deploy</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="purple">D22-23</Badge>
            <div>
              <p className="text-white font-medium">Audio y efectos</p>
              <p className="text-gray-400 text-xs">Música de fondo. SFX: motor, monedas, drift, items, countdown. Mezcla de volúmenes. Desbloqueo de audio en iOS.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Audio completo sin bugs en Chrome y Safari</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="purple">D24-25</Badge>
            <div>
              <p className="text-white font-medium">Persistencia y selección de vehículo</p>
              <p className="text-gray-400 text-xs">localStorage para récords. 2-3 vehículos con stats diferentes (velocidad, aceleración, manejo). Pantalla de selección.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: Récord persiste al recargar; vehículos tienen diferencias notables</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-950 rounded p-3">
            <Badge color="purple">D26-28</Badge>
            <div>
              <p className="text-white font-medium">Polish, testing y deploy</p>
              <p className="text-gray-400 text-xs">Optimización de rendimiento. Tests finales. Bug fixing. Deploy a Vercel/Netlify. Pruebas en dispositivos reales.</p>
              <p className="text-green-400 text-xs mt-1">✅ Hito: MVP desplegado y jugable en URL pública</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---- 9. RISKS ---- */
function RisksSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Riesgos técnicos identificados y recortes recomendados">
        ⚠️ 9. Riesgos y Recortes
      </SectionTitle>

      <Card>
        <h3 className="text-lg font-semibold text-red-300 mb-3">Riesgos Técnicos</h3>
        <div className="space-y-3">
          {[
            { risk: 'Rendimiento en móvil gama baja', impact: 'Alto', prob: 'Media', mitigation: 'Resolution scaling, object pooling, throttling de HUD. Testear en dispositivo real desde semana 1.' },
            { risk: 'Controles táctiles imprecisos', impact: 'Alto', prob: 'Media', mitigation: 'Zonas de toque grandes (mínimo 48px). Feedback visual inmediato. Iterar con testing real en móvil.' },
            { risk: 'IA que se atasca en curvas', impact: 'Medio', prob: 'Alta', mitigation: 'Waypoints con margen de error. Sistema de "unstuck" que empuja al kart hacia el waypoint si está parado >2s.' },
            { risk: 'Audio no funciona en iOS Safari', impact: 'Medio', prob: 'Alta', mitigation: 'Desbloquear AudioContext en primer touch event. Usar Howler.js si Phaser audio falla en iOS.' },
            { risk: 'Phaser bundle size excesivo', impact: 'Bajo', prob: 'Media', mitigation: 'Importar solo módulos necesarios de Phaser. Tree-shaking con Vite. Target: &lt;500KB gzip.' },
            { risk: 'Colisiones inconsistentes en bordes curvos', impact: 'Medio', prob: 'Media', mitigation: 'Aproximar curvas con segmentos rectos cortos. Usar múltiples bodies estáticos en vez de un polígono complejo.' },
            { risk: 'Scope creep (añadir features)', impact: 'Alto', prob: 'Alta', mitigation: 'Lista de tareas cerrada. Cualquier feature nueva requiere eliminar otra. Revisión semanal de scope.' },
          ].map((r, i) => (
            <div key={i} className="bg-gray-950 rounded-lg p-3 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">{r.risk}</span>
                <Badge color={r.impact === 'Alto' ? 'red' : r.impact === 'Medio' ? 'yellow' : 'blue'}>
                  Impacto: {r.impact}
                </Badge>
                <Badge color={r.prob === 'Alta' ? 'red' : r.prob === 'Media' ? 'yellow' : 'green'}>
                  Prob: {r.prob}
                </Badge>
              </div>
              <p className="text-gray-400">Mitigación: {r.mitigation}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-yellow-300 mb-3">Recortes Recomendados (si el tiempo apremia)</h3>
        <p className="text-sm text-gray-400 mb-3">Ordenados de menor a mayor impacto en la experiencia. Recortar desde abajo:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 bg-gray-950 rounded p-3">
            <span className="text-green-400 font-mono text-xs">1°</span>
            <div>
              <p className="text-white font-medium">Eliminar selección de vehículo</p>
              <p className="text-gray-400 text-xs">Usar un solo kart. Impacto mínimo en la experiencia de carrera.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-950 rounded p-3">
            <span className="text-green-400 font-mono text-xs">2°</span>
            <div>
              <p className="text-white font-medium">Reducir a 1 solo tipo de item</p>
              <p className="text-gray-400 text-xs">Solo boost/turbo. Eliminar caparazón y plátano (complejidad de IA y colisiones).</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-950 rounded p-3">
            <span className="text-yellow-400 font-mono text-xs">3°</span>
            <div>
              <p className="text-white font-medium">Eliminar monedas</p>
              <p className="text-gray-400 text-xs">Sin sistema de monedas. Los items se obtienen solo de cajas.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-950 rounded p-3">
            <span className="text-yellow-400 font-mono text-xs">4°</span>
            <div>
              <p className="text-white font-medium">Reducir a 1 rival IA</p>
              <p className="text-gray-400 text-xs">Carrera 1v1 en vez de 1v3. Menos colisiones, menos cálculo de posiciones.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-950 rounded p-3">
            <span className="text-red-400 font-mono text-xs">5°</span>
            <div>
              <p className="text-white font-medium">Eliminar audio</p>
              <p className="text-gray-400 text-xs">Sin música ni SFX. Impacto notable en inmersión pero no rompe la jugabilidad.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-950 rounded p-3">
            <span className="text-red-400 font-mono text-xs">6°</span>
            <div>
              <p className="text-white font-medium">Eliminar minimapa</p>
              <p className="text-gray-400 text-xs">Sin minimapa en HUD. El jugador navega solo con la vista del circuito.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---- 10. TASKS ---- */
function TasksSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Lista ordenada de tareas para implementar el MVP con dependencias">
        ✅ 10. Tareas del MVP
      </SectionTitle>

      <Card>
        <p className="text-sm text-gray-400 mb-4">
          Tareas ordenadas por prioridad y dependencias. Cada tarea debe ser completada en 1-2 días.
          Las dependencias indican qué tarea debe estar terminada antes.
        </p>
        <div className="space-y-2">
          {[
            { id: 'T01', task: 'Inicializar proyecto Vite + React + TS + Tailwind', deps: '-', priority: 'P0', estimate: '2h' },
            { id: 'T02', task: 'Instalar y configurar Phaser 3', deps: 'T01', priority: 'P0', estimate: '2h' },
            { id: 'T03', task: 'Configurar Vitest y primer test', deps: 'T01', priority: 'P0', estimate: '1h' },
            { id: 'T04', task: 'Crear estructura de directorios completa', deps: 'T01', priority: 'P0', estimate: '1h' },
            { id: 'T05', task: 'Implementar EventBus tipado (GameBridge)', deps: 'T02', priority: 'P0', estimate: '3h' },
            { id: 'T06', task: 'BootScene: carga de assets placeholder', deps: 'T02', priority: 'P0', estimate: '2h' },
            { id: 'T07', task: 'Entidad Kart: sprite, propiedades, constructor', deps: 'T06', priority: 'P0', estimate: '3h' },
            { id: 'T08', task: 'MovementSystem: aceleración y giro básico', deps: 'T07', priority: 'P0', estimate: '4h' },
            { id: 'T09', task: 'Tests unitarios de MovementSystem', deps: 'T08', priority: 'P0', estimate: '2h' },
            { id: 'T10', task: 'Definir datos del circuito (waypoints)', deps: '-', priority: 'P0', estimate: '3h' },
            { id: 'T11', task: 'Renderizar circuito (tiles/sprites)', deps: 'T10, T06', priority: 'P0', estimate: '4h' },
            { id: 'T12', task: 'CollisionSystem: bordes de pista', deps: 'T11, T08', priority: 'P0', estimate: '4h' },
            { id: 'T13', task: 'CameraSystem: seguir al jugador', deps: 'T08', priority: 'P0', estimate: '2h' },
            { id: 'T14', task: 'Drift: mecánica de derrape', deps: 'T08', priority: 'P1', estimate: '4h' },
            { id: 'T15', task: 'Drift: mini-turbo con niveles', deps: 'T14', priority: 'P1', estimate: '3h' },
            { id: 'T16', task: 'LapSystem: checkpoints y vueltas', deps: 'T10, T12', priority: 'P0', estimate: '4h' },
            { id: 'T17', task: 'Tests unitarios de LapSystem', deps: 'T16', priority: 'P1', estimate: '2h' },
            { id: 'T18', task: 'PositionSystem: cálculo de posiciones', deps: 'T16', priority: 'P1', estimate: '3h' },
            { id: 'T19', task: 'AISystem: seguimiento de waypoints', deps: 'T08, T10', priority: 'P0', estimate: '5h' },
            { id: 'T20', task: 'AISystem: variación de velocidad y comportamiento', deps: 'T19', priority: 'P1', estimate: '3h' },
            { id: 'T21', task: 'Colisiones kart-kart', deps: 'T12, T19', priority: 'P1', estimate: '3h' },
            { id: 'T22', task: 'Entidad Coin + recogida', deps: 'T07, T11', priority: 'P1', estimate: '3h' },
            { id: 'T23', task: 'Entidad ItemBox + asignación de item', deps: 'T07, T11', priority: 'P1', estimate: '3h' },
            { id: 'T24', task: 'ItemSystem: 2-3 tipos de items', deps: 'T23', priority: 'P1', estimate: '5h' },
            { id: 'T25', task: 'React: GameCanvas component', deps: 'T02, T05', priority: 'P0', estimate: '2h' },
            { id: 'T26', task: 'React: HUD (velocidad, posición, vuelta)', deps: 'T25, T16, T18', priority: 'P1', estimate: '3h' },
            { id: 'T27', task: 'React: TouchControls', deps: 'T25', priority: 'P0', estimate: '4h' },
            { id: 'T28', task: 'Integrar TouchControls → Input → Movement', deps: 'T27, T08', priority: 'P0', estimate: '3h' },
            { id: 'T29', task: 'React: MainMenu', deps: 'T25', priority: 'P1', estimate: '2h' },
            { id: 'T30', task: 'React: VehicleSelect', deps: 'T29', priority: 'P2', estimate: '3h' },
            { id: 'T31', task: 'React: PauseMenu', deps: 'T25, T26', priority: 'P1', estimate: '2h' },
            { id: 'T32', task: 'React: ResultsScreen', deps: 'T16, T18', priority: 'P1', estimate: '3h' },
            { id: 'T33', task: 'React: Countdown overlay (3-2-1-GO)', deps: 'T25', priority: 'P1', estimate: '2h' },
            { id: 'T34', task: 'Audio: SFX básicos (moneda, drift, boost)', deps: 'T06', priority: 'P2', estimate: '3h' },
            { id: 'T35', task: 'Audio: música de fondo', deps: 'T06', priority: 'P2', estimate: '2h' },
            { id: 'T36', task: 'Persistencia: localStorage récords', deps: '-', priority: 'P2', estimate: '2h' },
            { id: 'T37', task: 'Optimización: object pooling', deps: 'T22, T24', priority: 'P2', estimate: '3h' },
            { id: 'T38', task: 'Optimización: resolution scaling', deps: 'T13', priority: 'P2', estimate: '2h' },
            { id: 'T39', task: 'Testing manual en móvil real', deps: 'T28', priority: 'P1', estimate: '4h' },
            { id: 'T40', task: 'Deploy a Vercel/Netlify', deps: 'T39', priority: 'P1', estimate: '2h' },
          ].map((t) => (
            <div key={t.id} className="flex items-center gap-3 bg-gray-950 rounded p-2 text-xs">
              <span className="font-mono text-gray-500 w-8">{t.id}</span>
              <Badge color={t.priority === 'P0' ? 'red' : t.priority === 'P1' ? 'yellow' : 'blue'}>
                {t.priority}
              </Badge>
              <span className="flex-1 text-gray-300">{t.task}</span>
              <span className="text-gray-500 hidden md:inline">deps: {t.deps}</span>
              <span className="text-gray-600 w-8 text-right">{t.estimate}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span><Badge color="red">P0</Badge> Imprescindible</span>
          <span><Badge color="yellow">P1</Badge> Importante</span>
          <span><Badge color="blue">P2</Badge> Deseable</span>
        </div>
      </Card>
    </div>
  );
}

/* ---- COMPARISON ---- */
function ComparisonSection() {
  return (
    <div className="space-y-6">
      <SectionTitle subtitle="Comparativa de perspectivas y recomendación">
        🔍 Vista Superior 2D vs Pseudo-3D
      </SectionTitle>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🗺️</span>
            <h3 className="text-lg font-semibold text-green-300">Vista Superior 2D (Top-Down)</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <p className="font-semibold text-white text-xs">Descripción</p>
              <p className="text-xs text-gray-400">Cámara perpendicular al plano del circuito. Los karts se ven desde arriba. Similar a los primeros Micro Machines o Super Sprint.</p>
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Ventajas</p>
              <ul className="text-xs text-gray-400 space-y-0.5">
                <li>✅ Implementación muy sencilla en Phaser</li>
                <li>✅ Colisiones simples (2D nativo)</li>
                <li>✅ Visión completa del circuito</li>
                <li>✅ Rendimiento excelente (pocos sprites)</li>
                <li>✅ Fácil de entender para el jugador</li>
                <li>✅ Assets más simples de producir</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Desventajas</p>
              <ul className="text-xs text-gray-400 space-y-0.5">
                <li>❌ Menos inmersivo / "emocionante"</li>
                <li>❌ No transmite sensación de velocidad</li>
                <li>❌ Derrape menos satisfactorio visualmente</li>
                <li>❌ Se aleja de la referencia Mario Kart</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Esfuerzo estimado</p>
              <p className="text-xs text-gray-400">2 semanas para MVP completo</p>
            </div>
          </div>
        </Card>

        <Card className="border-indigo-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏁</span>
            <h3 className="text-lg font-semibold text-indigo-300">Pseudo-3D (Detrás del Kart)</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <p className="font-semibold text-white text-xs">Descripción</p>
              <p className="text-xs text-gray-400">Cámara en tercera persona, detrás y encima del kart. El circuito se renderiza en 2D pero con perspectiva isométrica o projection mode 7. Similar a Mario Kart.</p>
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Ventajas</p>
              <ul className="text-xs text-gray-400 space-y-0.5">
                <li>✅ Mucha más inmersión y emoción</li>
                <li>✅ Sensación de velocidad real</li>
                <li>✅ Derrape visualmente satisfactorio</li>
                <li>✅ Más fiel a la referencia Mario Kart Tour</li>
                <li>✅ Mejor experiencia en móvil (vertical)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Desventajas</p>
              <ul className="text-xs text-gray-400 space-y-0.5">
                <li>❌ Implementación más compleja</li>
                <li>❌ Colisiones siguen siendo 2D pero la cámara añade complejidad</li>
                <li>❌ Requiere más assets (sprites con perspectiva)</li>
                <li>❌ Rendimiento ligeramente peor (más pixels en pantalla)</li>
                <li>❌ Puede causar mareo si la cámara no es suave</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white text-xs">Esfuerzo estimado</p>
              <p className="text-xs text-gray-400">3-4 semanas para MVP completo</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-green-500 bg-green-950/20">
        <h3 className="text-lg font-semibold text-green-300 mb-3">⭐ Recomendación: Pseudo-3D (con estrategia híbrida)</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-white">Recomiendo la perspectiva pseudo-3D detrás del kart</strong> como opción principal,
            con la siguiente estrategia para mantener el plazo:
          </p>
          <div className="bg-gray-950 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-white">Estrategia de implementación:</p>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>Usar Phaser 3 con cámara isométrica (no Mode 7, que es más complejo)</li>
              <li>El mundo sigue siendo 2D internamente (física, colisiones, waypoints)</li>
              <li>La cámara se coloca en ángulo (~60°) detrás del kart, con rotación</li>
              <li>Los sprites del kart se dibujan con perspectiva (sprite rotations o pre-rendered angles)</li>
              <li>El circuito se renderiza como tilemap con skew/perspective CSS o Phaser camera transform</li>
            </ol>
          </div>
          <div className="bg-gray-950 rounded-lg p-4">
            <p className="font-semibold text-white text-xs mb-1">Alternativa de contingencia:</p>
            <p className="text-xs text-gray-400">
              Si en la semana 1 la perspectiva pseudo-3D resulta demasiado compleja o causa problemas de rendimiento,
              <strong> pivotar a top-down 2D</strong> es viable porque la lógica del juego (movimiento, IA, items, vueltas)
              es idéntica. Solo cambia la cámara. Esta es la razón principal para implementar la lógica primero
              y la cámara después.
            </p>
          </div>
          <div className="bg-gray-950 rounded-lg p-4">
            <p className="font-semibold text-white text-xs mb-1">¿Por qué no Mode 7 puro?</p>
            <p className="text-xs text-gray-400">
              Mode 7 (como SNES Mario Kart) requiere manipulación de tiles por scanline, lo cual es complejo
              y costoso en WebGL. La alternativa isométrica con Phaser ofrece un look 3D convincente con
              una fracción de la complejidad.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-purple-300 mb-3">Resumen de Comparativa</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-4 text-gray-400">Criterio</th>
                <th className="py-2 pr-4 text-gray-400">Top-Down 2D</th>
                <th className="py-2 text-gray-400">Pseudo-3D</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800"><td className="py-2 pr-4">Experiencia de carreras</td><td className="py-2 pr-4">⭐⭐</td><td className="py-2">⭐⭐⭐⭐</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4">Fidelidad a Mario Kart</td><td className="py-2 pr-4">⭐⭐</td><td className="py-2">⭐⭐⭐⭐</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4">Facilidad de implementación</td><td className="py-2 pr-4">⭐⭐⭐⭐⭐</td><td className="py-2">⭐⭐⭐</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4">Rendimiento móvil</td><td className="py-2 pr-4">⭐⭐⭐⭐⭐</td><td className="py-2">⭐⭐⭐⭐</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4">Riesgo técnico</td><td className="py-2 pr-4 text-green-400">Bajo</td><td className="py-2 text-yellow-400">Medio</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4">Tiempo a MVP</td><td className="py-2 pr-4">2 semanas</td><td className="py-2">3-4 semanas</td></tr>
              <tr className="border-b border-gray-800"><td className="py-2 pr-4">Reutilización de lógica</td><td className="py-2 pr-4 text-green-400">100% compartida</td><td className="py-2 text-green-400">100% compartida</td></tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
