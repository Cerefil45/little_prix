import { useEffect, useState } from 'react';
import { formatTime, getBestRecord, saveRecord } from '../../core/storage';
import type { BestRecord, RaceResult } from '../../core/types';

interface ResultsScreenProps {
  result: RaceResult;
  onRestart: () => void;
  onMenu: () => void;
}

export function ResultsScreen({ result, onRestart, onMenu }: ResultsScreenProps) {
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestRecord, setBestRecord] = useState<BestRecord | null>(null);

  useEffect(() => {
    // Cargar récord anterior
    const previous = getBestRecord(result.trackName);
    setBestRecord(previous);

    // Intentar guardar nuevo récord
    const wasNewRecord = saveRecord({
      trackName: result.trackName,
      bestTime: result.totalTime,
      bestLap: result.bestLap,
      lapTimes: result.lapTimes,
      achievedAt: result.finishedAt
    });

    setIsNewRecord(wasNewRecord);

    // Si es nuevo récord, actualizar el estado
    if (wasNewRecord) {
      setBestRecord({
        trackName: result.trackName,
        bestTime: result.totalTime,
        bestLap: result.bestLap,
        lapTimes: result.lapTimes,
        achievedAt: result.finishedAt
      });
    }
  }, [result]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800/90 backdrop-blur border border-gray-700 rounded-2xl p-6 max-w-md w-full">
        {/* Título */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🏁 Carrera Completada</h1>
          <p className="text-gray-400 text-sm">{result.trackName}</p>
          
          {/* Posición final */}
          {result.position && (
            <div className="mt-3 inline-block">
              <div className={`text-5xl font-bold ${
                result.position === 1 ? 'text-yellow-400' :
                result.position === 2 ? 'text-gray-300' :
                result.position === 3 ? 'text-orange-400' :
                'text-gray-500'
              }`}>
                {result.position}º
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {result.position === 1 ? '¡GANASTE!' : 
                 result.position === 2 ? '¡Excelente!' :
                 result.position === 3 ? '¡Buen trabajo!' :
                 'Sigue practicando'}
              </div>
            </div>
          )}
          
          {isNewRecord && (
            <div className="mt-3 inline-block px-4 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
              <span className="text-yellow-300 font-bold text-sm">⭐ NUEVO RÉCORD ⭐</span>
            </div>
          )}
        </div>

        {/* Tiempo total */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">TIEMPO TOTAL</div>
            <div className="text-4xl font-bold text-white font-mono">
              {formatTime(result.totalTime)}
            </div>
            {bestRecord && !isNewRecord && (
              <div className="text-xs text-gray-500 mt-1">
                Mejor: {formatTime(bestRecord.bestTime)}
              </div>
            )}
          </div>
        </div>

        {/* Tiempos por vuelta */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <div className="text-gray-400 text-xs mb-2">TIEMPOS POR VUELTA</div>
          <div className="space-y-1">
            {result.lapTimes.map((lapTime, index) => {
              const isBest = lapTime === result.bestLap;
              return (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Vuelta {index + 1}</span>
                  <span className={`font-mono ${isBest ? 'text-green-400 font-bold' : 'text-white'}`}>
                    {formatTime(lapTime)}
                    {isBest && ' ⚡'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between items-center text-sm">
            <span className="text-gray-400">Mejor vuelta</span>
            <span className="text-green-400 font-mono font-bold">
              {formatTime(result.bestLap)}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-2">
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
          >
            🔄 Correr de nuevo
          </button>
          <button
            onClick={onMenu}
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
          >
            🏠 Menú principal
          </button>
        </div>
      </div>
    </div>
  );
}
