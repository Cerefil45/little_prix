import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress: number; // 0-100
  onComplete?: () => void;
}

export function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Animar la barra de progreso suavemente
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.5) {
          clearInterval(interval);
          return progress;
        }
        return prev + diff * 0.1;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [progress]);

  // Cuando llega a 100%, llamar onComplete después de un breve delay
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center z-50">
      {/* Logo/Icono */}
      <div className="mb-8">
        <div className="text-6xl mb-4 animate-pulse">🏎️</div>
        <h1 className="text-3xl font-bold text-white text-center">Little Grand Prix</h1>
      </div>

      {/* Barra de progreso */}
      <div className="w-80 max-w-[80%]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Cargando circuito...</span>
          <span className="text-sm font-mono text-white">{Math.round(displayProgress)}%</span>
        </div>
        
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 transition-all duration-300 ease-out relative"
            style={{ width: `${displayProgress}%` }}
          >
            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Mensaje de estado */}
        <div className="mt-4 text-center">
          {progress < 30 && <p className="text-xs text-gray-500">Inicializando motor de juego...</p>}
          {progress >= 30 && progress < 60 && <p className="text-xs text-gray-500">Cargando circuito y karts...</p>}
          {progress >= 60 && progress < 90 && <p className="text-xs text-gray-500">Preparando rivales...</p>}
          {progress >= 90 && progress < 100 && <p className="text-xs text-gray-500">¡Casi listo!</p>}
          {progress >= 100 && <p className="text-xs text-green-400 font-semibold">¡Listo para correr!</p>}
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
