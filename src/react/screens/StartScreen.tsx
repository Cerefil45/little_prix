/**
 * StartScreen - Pantalla de inicio del juego
 * Permite al jugador entrar a la carrera o volver a la documentación.
 */

interface StartScreenProps {
  onPlay: () => void;
  onBack: () => void;
  onRoadmap: () => void;
}

export function StartScreen({ onPlay, onBack, onRoadmap }: StartScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        {/* Líneas de circuito decorativas */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 600">
          <ellipse cx="400" cy="300" rx="300" ry="200" fill="none" stroke="white" strokeWidth="40" />
          <ellipse cx="400" cy="300" rx="300" ry="200" fill="none" stroke="white" strokeWidth="2" strokeDasharray="20 10" />
        </svg>
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-center max-w-md">
        {/* Logo / Título */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🏎️</div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Little Grand Prix
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Prototipo v0.2 — Circuito Inicial</p>
        </div>

        {/* Info del circuito */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 text-left">
          <h2 className="text-white font-bold text-sm mb-2">🏁 Circuito Inicial</h2>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>• Óvalo con curvas</div>
            <div>• 3 vueltas</div>
            <div>• Colisiones con bordes</div>
            <div>• Sistema de drift</div>
          </div>
        </div>

        {/* Controles info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-8 text-left">
          <h2 className="text-white font-bold text-sm mb-2">🎮 Controles</h2>
          <div className="space-y-1 text-xs text-gray-400">
            <p><span className="text-white font-mono">W / ↑</span> — Acelerar</p>
            <p><span className="text-white font-mono">A D / ← →</span> — Girar</p>
            <p><span className="text-white font-mono">S / ↓</span> — Frenar</p>
            <p><span className="text-white font-mono">Espacio / Shift</span> — Derrapar</p>
            <p className="text-gray-500 mt-2">📱 En móvil: usa los botones en pantalla</p>
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={onPlay}
            className="w-full py-4 px-6 rounded-xl bg-green-600 hover:bg-green-500
              text-white font-bold text-xl transition-all transform hover:scale-105
              shadow-lg shadow-green-600/30"
          >
            🏁 INICIAR CARRERA
          </button>
          <button
            onClick={onRoadmap}
            className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500
              text-white font-bold text-lg transition-all transform hover:scale-105
              shadow-lg shadow-blue-600/30"
          >
            🗺️ Ver Roadmap
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 px-6 rounded-xl bg-gray-800 hover:bg-gray-700
              text-gray-300 font-medium text-sm transition-colors border border-gray-700"
          >
            📋 Volver al Plan Técnico
          </button>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs mt-8">
          Prototipo de demostración · Phaser 3 + React + TypeScript
        </p>
      </div>
    </div>
  );
}
