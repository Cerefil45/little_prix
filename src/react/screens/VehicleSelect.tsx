/**
 * VehicleSelect - Pantalla de selección de vehículo
 * Permite al jugador elegir entre diferentes karts con stats únicos
 */

import { useState } from 'react';

interface VehicleSelectProps {
  onSelect: (vehicleId: string) => void;
  onBack: () => void;
}

export interface VehicleStats {
  id: string;
  name: string;
  description: string;
  color: number;
  maxSpeed: number;      // 0-100
  acceleration: number;  // 0-100
  handling: number;      // 0-100
  icon: string;
}

export const vehicles: VehicleStats[] = [
  {
    id: 'balanced',
    name: 'Relámpago',
    description: 'Equilibrado en todo. Perfecto para principiantes.',
    color: 0xe63946,
    maxSpeed: 70,
    acceleration: 70,
    handling: 70,
    icon: '⚡'
  },
  {
    id: 'speed',
    name: 'Turbo Max',
    description: 'Velocidad máxima, pero difícil de controlar.',
    color: 0x4ecdc4,
    maxSpeed: 95,
    acceleration: 60,
    handling: 45,
    icon: '🚀'
  },
  {
    id: 'agile',
    name: 'Serpiente',
    description: 'Manejo excepcional, ideal para curvas cerradas.',
    color: 0x95e1d3,
    maxSpeed: 55,
    acceleration: 75,
    handling: 95,
    icon: '🐍'
  }
];

export function VehicleSelect({ onSelect, onBack }: VehicleSelectProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0].id);

  const handleSelect = () => {
    onSelect(selectedVehicle);
  };

  const selectedStats = vehicles.find(v => v.id === selectedVehicle)!;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-4">
      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🏎️ Elige tu Kart</h1>
        <p className="text-gray-400">Selecciona el vehículo que mejor se adapte a tu estilo</p>
      </div>

      {/* Grid de vehículos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full mb-8">
        {vehicles.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle.id;
          return (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle.id)}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 scale-105'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Icono del vehículo */}
              <div className="text-6xl mb-4">{vehicle.icon}</div>
              
              {/* Nombre */}
              <h3 className="text-xl font-bold text-white mb-2">{vehicle.name}</h3>
              
              {/* Descripción */}
              <p className="text-sm text-gray-400 mb-4">{vehicle.description}</p>
              
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

      {/* Estadísticas detalladas */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 max-w-2xl w-full mb-6">
        <h2 className="text-xl font-bold text-white mb-4 text-center">
          {selectedStats.icon} {selectedStats.name}
        </h2>
        
        <div className="space-y-4">
          {/* Velocidad Máxima */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300">Velocidad Máxima</span>
              <span className="text-sm font-bold text-white">{selectedStats.maxSpeed}%</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${selectedStats.maxSpeed}%` }}
              />
            </div>
          </div>

          {/* Aceleración */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300">Aceleración</span>
              <span className="text-sm font-bold text-white">{selectedStats.acceleration}%</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${selectedStats.acceleration}%` }}
              />
            </div>
          </div>

          {/* Manejo */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300">Manejo</span>
              <span className="text-sm font-bold text-white">{selectedStats.handling}%</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-300"
                style={{ width: `${selectedStats.handling}%` }}
              />
            </div>
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
