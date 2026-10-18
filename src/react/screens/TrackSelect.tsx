import { useState } from 'react';

interface TrackSelectProps {
  onSelect: (trackId: string) => void;
  onBack: () => void;
}

const tracks = [
  {
    id: 'circuit1',
    name: 'Circuito Inicial',
    description: 'Óvalo clásico con curvas suaves. Perfecto para principiantes.',
    difficulty: 'Fácil',
    icon: '🏁',
    color: 'from-green-600 to-green-800',
  },
  {
    id: 'circuit2',
    name: 'Ocho Loca',
    description: 'Circuito en forma de 8 con cruces y curvas cerradas. ¡Desafiante!',
    difficulty: 'Media',
    icon: '🔄',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'circuit3',
    name: 'Chicanas Extremas',
    description: 'Circuito técnico con chicanas en zigzag y rectas largas. Solo para expertos.',
    difficulty: 'Difícil',
    icon: '⚡',
    color: 'from-purple-600 to-purple-800',
  },
];

export function TrackSelect({ onSelect, onBack }: TrackSelectProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>('circuit1');

  const handleSelect = () => {
    onSelect(selectedTrack);
  };

  const selectedTrackData = tracks.find(t => t.id === selectedTrack)!;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-4">
      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🏁 Elige tu Circuito</h1>
        <p className="text-gray-400">Selecciona el circuito que mejor se adapte a tu habilidad</p>
      </div>

      {/* Grid de circuitos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl w-full mb-8">
        {tracks.map((track) => {
          const isSelected = selectedTrack === track.id;
          return (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 scale-105'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Icono del circuito */}
              <div className="text-6xl mb-4">{track.icon}</div>
              
              {/* Nombre */}
              <h3 className="text-xl font-bold text-white mb-2">{track.name}</h3>
              
              {/* Descripción */}
              <p className="text-sm text-gray-400 mb-4">{track.description}</p>
              
              {/* Dificultad */}
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${track.color}`}>
                {track.difficulty}
              </div>
              
              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Información detallada */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mb-6">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          {selectedTrackData.icon} {selectedTrackData.name}
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Dificultad:</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full bg-gradient-to-r ${selectedTrackData.color} text-white`}>
              {selectedTrackData.difficulty}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Vueltas:</span>
            <span className="text-sm font-bold text-white">3</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Rivales:</span>
            <span className="text-sm font-bold text-white">3 IAs</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Items:</span>
            <span className="text-sm font-bold text-white">6 tipos</span>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 max-w-2xl w-full">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 rounded-xl bg-gray-700 hover:bg-gray-600
            text-white font-bold text-lg transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={handleSelect}
          className="flex-1 py-3 px-6 rounded-xl bg-green-600 hover:bg-green-500
            text-white font-bold text-lg transition-colors"
        >
          ¡Correr! 🏁
        </button>
      </div>
    </div>
  );
}
