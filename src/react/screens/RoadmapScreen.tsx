/**
 * RoadmapScreen - Roadmap interactivo de mejoras
 * Muestra el plan de desarrollo completo del juego
 */

import { useState } from 'react';

interface RoadmapScreenProps {
  onBack: () => void;
}

type Version = 'current' | 'v0.3' | 'v0.4' | 'v0.5' | 'v1.0';

export function RoadmapScreen({ onBack }: RoadmapScreenProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version>('v0.4');

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <h1 className="text-lg font-bold text-white">Roadmap de Desarrollo</h1>
              <p className="text-xs text-gray-400">Little Grand Prix</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Estado Actual */}
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-700 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">✅</span>
            <div>
              <h2 className="text-xl font-bold text-green-300">v0.3 Completado</h2>
              <p className="text-sm text-green-400">Contenido y variedad añadidos</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-black/30 rounded p-2">
              <div className="text-green-400 font-bold">✓ Monedas</div>
            </div>
            <div className="bg-black/30 rounded p-2">
              <div className="text-green-400 font-bold">✓ Cajas de Items</div>
            </div>
            <div className="bg-black/30 rounded p-2">
              <div className="text-green-400 font-bold">✓ Sistema de Items</div>
            </div>
            <div className="bg-black/30 rounded p-2">
              <div className="text-green-400 font-bold">✓ Selección Vehículo</div>
            </div>
            <div className="bg-black/30 rounded p-2">
              <div className="text-green-400 font-bold">✓ Rivales IA</div>
            </div>
            <div className="bg-black/30 rounded p-2">
              <div className="text-green-400 font-bold">✓ Sistema de Vueltas</div>
            </div>
            <div className="bg-black/30 rounded p-2">
              <div className="text-green-400 font-bold">✓ Posiciones</div>
            </div>
            <div className="bg-black/30 rounded p-2">
              <div className="text-green-400 font-bold">✓ Finalización Carrera</div>
            </div>
          </div>
        </div>

        {/* Timeline Visual */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">📅 Timeline de Desarrollo</h3>
          <div className="relative">
            {/* Línea de tiempo */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />
            
            {/* Versiones */}
            <div className="space-y-4">
              <VersionNode
                version="v0.2"
                title="Ciclo Completo"
                status="completed"
                duration="2 semanas"
                onClick={() => setSelectedVersion('current')}
                selected={selectedVersion === 'current'}
              />
              <VersionNode
                version="v0.3"
                title="Contenido y Variedad"
                status="completed"
                duration="1-2 semanas"
                onClick={() => setSelectedVersion('v0.3')}
                selected={selectedVersion === 'v0.3'}
              />
              <VersionNode
                version="v0.4"
                title="Polish y Meta"
                status="planned"
                duration="1 semana"
                onClick={() => setSelectedVersion('v0.4')}
                selected={selectedVersion === 'v0.4'}
              />
              <VersionNode
                version="v0.5"
                title="Expansión"
                status="planned"
                duration="1-2 semanas"
                onClick={() => setSelectedVersion('v0.5')}
                selected={selectedVersion === 'v0.5'}
              />
              <VersionNode
                version="v1.0"
                title="Lanzamiento"
                status="future"
                duration="1 semana"
                onClick={() => setSelectedVersion('v1.0')}
                selected={selectedVersion === 'v1.0'}
              />
            </div>
          </div>
        </div>

        {/* Detalle de Versión Seleccionada */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {selectedVersion === 'current' && <CurrentVersionDetail />}
          {selectedVersion === 'v0.3' && <V03Detail />}
          {selectedVersion === 'v0.4' && <V04Detail />}
          {selectedVersion === 'v0.5' && <V05Detail />}
          {selectedVersion === 'v1.0' && <V10Detail />}
        </div>
      </div>
    </div>
  );
}

function VersionNode({
  version,
  title,
  status,
  duration,
  onClick,
  selected,
}: {
  version: string;
  title: string;
  status: 'completed' | 'next' | 'planned' | 'future';
  duration: string;
  onClick: () => void;
  selected: boolean;
}) {
  const statusColors = {
    completed: 'bg-green-500 border-green-400',
    next: 'bg-blue-500 border-blue-400 animate-pulse',
    planned: 'bg-purple-500 border-purple-400',
    future: 'bg-gray-600 border-gray-500',
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex items-start gap-4 w-full text-left p-3 rounded-lg transition-all ${
        selected ? 'bg-gray-800 ring-2 ring-blue-500' : 'hover:bg-gray-800/50'
      }`}
    >
      <div className={`relative z-10 w-16 h-16 rounded-full ${statusColors[status]} border-4 flex items-center justify-center text-white font-bold text-sm`}>
        {version}
      </div>
      <div className="flex-1 pt-2">
        <h4 className="text-white font-bold">{title}</h4>
        <p className="text-xs text-gray-400">{duration}</p>
      </div>
    </button>
  );
}

function CurrentVersionDetail() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-green-300 mb-4">✅ v0.2 - Ciclo de Juego Completo</h3>
      <p className="text-gray-300 mb-4">
        El juego tiene un ciclo completo y funcional: inicio con countdown, carrera con cronómetro,
        sistema de vueltas, resultados con récords, y rivales IA.
      </p>
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
        <h4 className="text-green-300 font-bold mb-2">Características Implementadas:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✓ Circuito ovalado con límites y colisiones</li>
          <li>✓ Kart controlable con teclado y táctil</li>
          <li>✓ Sistema de drift con mini-turbo</li>
          <li>✓ 3 rivales IA con navegación por waypoints</li>
          <li>✓ Sistema de vueltas con checkpoints</li>
          <li>✓ Cronómetro y tiempos por vuelta</li>
          <li>✓ Pantalla de resultados con récords</li>
          <li>✓ Posiciones en tiempo real</li>
          <li>✓ Countdown 3-2-1-GO</li>
          <li>✓ Persistencia de récords en localStorage</li>
        </ul>
      </div>
    </div>
  );
}

function V03Detail() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-green-300 mb-4">✅ v0.3 - Completado</h3>
      <p className="text-gray-300 mb-4">
        Elementos añadidos para hacer el juego más rico y rejugarble.
      </p>
      
      <div className="space-y-4">
        <FeatureCard
          title="Monedas ✓"
          priority="alta"
          effort="3-4h"
          description="Coleccionables esparcidos por el circuito que dan boost menor de velocidad al recogerlos."
          criteria={['✓ Aparecen 10 monedas en el circuito', '✓ Se recogen al pasar por encima', '✓ Dan +50 velocidad', '✓ Respawan después de 5 segundos']}
        />
        
        <FeatureCard
          title="Cajas de Items ✓"
          priority="alta"
          effort="3-4h"
          description="Cajas que aparecen en posiciones fijas y otorgan un item aleatorio al pasar por ellas."
          criteria={['✓ 5 cajas distribuidas en el circuito', '✓ Respawan cada 10 segundos', '✓ Otorgan 1 item aleatorio', '✓ Animación de rotación']}
        />
        
        <FeatureCard
          title="Sistema de Items ✓"
          priority="alta"
          effort="6-8h"
          description="Items utilizables con efectos diferentes."
          criteria={[
            '✓ Turbo: boost de velocidad x1.5 por 3 segundos',
            '✓ Caparazón: impacta al rival más cercano y lo detiene 2s',
            '✓ Plátano: trampa estática que detiene al que la pisa',
          ]}
        />
        
        <FeatureCard
          title="Selección de Vehículo ✓"
          priority="media"
          effort="4-5h"
          description="3 karts con estadísticas diferentes."
          criteria={[
            '✓ Relámpago: stats balanceados',
            '✓ Turbo Max: +20% velocidad, -15% aceleración, -20% manejo',
            '✓ Serpiente: -15% velocidad, +25% manejo',
          ]}
        />
        
        <FeatureCard
          title="Segundo Circuito"
          priority="media"
          effort="4-5h"
          description="Otro trazado con forma diferente (ej: figura 8 o con chicanas)."
          criteria={['Diseño diferente al óvalo', 'Mismos sistemas de colisiones', 'Récords separados por circuito']}
        />
      </div>

      <div className="mt-6 bg-green-900/20 border border-green-700 rounded-lg p-4">
        <h4 className="text-green-300 font-bold mb-2">📊 Estado:</h4>
        <p className="text-sm text-gray-300">
          <strong>Completado:</strong> 4 de 5 features<br />
          <strong>Pendiente:</strong> Segundo circuito<br />
          <strong>Impacto:</strong> Alto - El juego es mucho más rejugarble
        </p>
      </div>
    </div>
  );
}

function V04Detail() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-purple-300 mb-4">✨ v0.4 - Polish y Meta-progresión</h3>
      <p className="text-gray-300 mb-4">
        Detalles que elevan la calidad percibida y añaden profundidad.
      </p>
      
      <div className="space-y-4">
        <FeatureCard
          title="Audio Completo"
          priority="alta"
          effort="4-5h"
          description="Música de fondo y efectos de sonido."
          criteria={[
            'Música de fondo en menú y carrera',
            'SFX: motor, drift, colisión, moneda, item',
            'Desbloqueo de audio en iOS',
            'Control de volumen',
          ]}
        />
        
        <FeatureCard
          title="Efectos Visuales"
          priority="media"
          effort="4-5h"
          description="Partículas y efectos que mejoran el feedback visual."
          criteria={[
            'Partículas de drift mejoradas',
            'Estela de turbo',
            'Animación de monedas (rotación + brillo)',
            'Explosión al recoger items',
          ]}
        />
        
        <FeatureCard
          title="Minimapa"
          priority="media"
          effort="3-4h"
          description="Vista pequeña del circuito con posición de todos los karts."
          criteria={['Muestra el circuito completo', 'Puntos de colores para cada kart', 'Actualización en tiempo real', 'Esquina superior izquierda']}
        />
        
        <FeatureCard
          title="Tutorial Inicial"
          priority="baja"
          effort="3-4h"
          description="Guía interactiva en la primera partida."
          criteria={['Highlight de controles', 'Mensajes explicativos', 'Se puede saltar', 'Solo aparece una vez']}
        />
        
        <FeatureCard
          title="Dificultad Escalable"
          priority="baja"
          effort="3-4h"
          description="IA más rápida en vueltas posteriores."
          criteria={['IA aumenta velocidad cada vuelta', '3 niveles de dificultad', 'Selección antes de carrera']}
        />
      </div>

      <div className="mt-6 bg-purple-900/20 border border-purple-700 rounded-lg p-4">
        <h4 className="text-purple-300 font-bold mb-2">📊 Estimación Total:</h4>
        <p className="text-sm text-gray-300">
          <strong>Duración:</strong> 1 semana<br />
          <strong>Esfuerzo:</strong> 17-22 horas<br />
          <strong>Impacto:</strong> Medio - Mejora la experiencia pero no es esencial
        </p>
      </div>
    </div>
  );
}

function V05Detail() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-orange-300 mb-4">🚀 v0.5 - Expansión de Contenido</h3>
      <p className="text-gray-300 mb-4">
        Más contenido para jugadores avanzados y mayor rejuguibilidad.
      </p>
      
      <div className="space-y-4">
        <FeatureCard
          title="Sistema de Logros"
          priority="media"
          effort="4-5h"
          description="Logros desbloqueables por completar desafíos."
          criteria={[
            'Primera victoria',
            'Completar vuelta sin salir de pista',
            'Drift perfecto (3 segundos)',
            'Ganar sin usar items',
            'Persistencia en localStorage',
          ]}
        />
        
        <FeatureCard
          title="Más Circuitos (2-3 adicionales)"
          priority="media"
          effort="8-10h"
          description="Trazados adicionales con diseños únicos."
          criteria={[
            'Circuito en forma de 8',
            'Circuito con chicanas',
            'Circuito con atajos',
            'Cada uno con récords propios',
          ]}
        />
        
        <FeatureCard
          title="Más Items (2-3 adicionales)"
          priority="baja"
          effort="5-6h"
          description="Items adicionales para más variedad estratégica."
          criteria={[
            'Estrella: invencibilidad por 5 segundos',
            'Rayo: ralentiza a todos los rivales',
            'Escudo: bloquea el próximo impacto',
          ]}
        />
        
        <FeatureCard
          title="Skins de Kart"
          priority="baja"
          effort="3-4h"
          description="Apariencias desbloqueables para el kart."
          criteria={['Desbloqueo por logros o récords', '5-10 skins diferentes', 'Selección en menú']}
        />
        
        <FeatureCard
          title="Estadísticas de Sesión"
          priority="baja"
          effort="2-3h"
          description="Tracking de métricas del jugador."
          criteria={[
            'Distancia total recorrida',
            'Número de carreras',
            'Tiempo total jugado',
            'Mejores tiempos por circuito',
          ]}
        />
      </div>

      <div className="mt-6 bg-orange-900/20 border border-orange-700 rounded-lg p-4">
        <h4 className="text-orange-300 font-bold mb-2">📊 Estimación Total:</h4>
        <p className="text-sm text-gray-300">
          <strong>Duración:</strong> 1-2 semanas<br />
          <strong>Esfuerzo:</strong> 22-28 horas<br />
          <strong>Impacto:</strong> Medio-Alto - Para jugadores que quieren más profundidad
        </p>
      </div>
    </div>
  );
}

function V10Detail() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-red-300 mb-4">🎉 v1.0 - Lanzamiento</h3>
      <p className="text-gray-300 mb-4">
        Preparación final para lanzamiento público.
      </p>
      
      <div className="space-y-4">
        <FeatureCard
          title="PWA (Progressive Web App)"
          priority="alta"
          effort="3-4h"
          description="Instalar como app en el móvil."
          criteria={[
            'Manifest.json configurado',
            'Service Worker para offline',
            'Iconos para home screen',
            'Prompt de instalación',
          ]}
        />
        
        <FeatureCard
          title="Optimización de Rendimiento"
          priority="alta"
          effort="4-5h"
          description="Asegurar 60 FPS en gama media."
          criteria={[
            'Code splitting de Phaser',
            'Optimización de sprites',
            'Lazy loading de assets',
            'Testing en dispositivos reales',
          ]}
        />
        
        <FeatureCard
          title="QA y Testing Exhaustivo"
          priority="alta"
          effort="6-8h"
          description="Pruebas en múltiples dispositivos y navegadores."
          criteria={[
            'Chrome, Safari, Firefox, Edge',
            'iOS y Android',
            'Diferentes tamaños de pantalla',
            'Pruebas de usabilidad',
          ]}
        />
        
        <FeatureCard
          title="Documentación Pública"
          priority="media"
          effort="2-3h"
          description="README, guía de controles, FAQ."
          criteria={['README.md completo', 'Guía de instalación', 'FAQ de problemas comunes', 'Screenshots y GIFs']}
        />
        
        <FeatureCard
          title="Analytics y Feedback"
          priority="baja"
          effort="2-3h"
          description="Sistema para recoger feedback de usuarios."
          criteria={[
            'Formulario de feedback',
            'Botón de reporte de bugs',
            'Tracking básico de uso (opcional)',
          ]}
        />
      </div>

      <div className="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
        <h4 className="text-red-300 font-bold mb-2">📊 Estimación Total:</h4>
        <p className="text-sm text-gray-300">
          <strong>Duración:</strong> 1 semana<br />
          <strong>Esfuerzo:</strong> 17-23 horas<br />
          <strong>Impacto:</strong> Crítico - Esencial para lanzamiento profesional
        </p>
      </div>

      <div className="mt-4 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-600 rounded-lg p-4">
        <h4 className="text-white font-bold mb-2">🎯 Criterios de Lanzamiento:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✓ 60 FPS estables en gama media</li>
          <li>✓ Sin bugs críticos en Chrome/Safari</li>
          <li>✓ Controles táctiles funcionando perfectamente</li>
          <li>✓ Audio sin problemas en iOS</li>
          <li>✓ Instalable como PWA</li>
          <li>✓ Documentación completa</li>
        </ul>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  priority,
  effort,
  description,
  criteria,
}: {
  title: string;
  priority: 'alta' | 'media' | 'baja';
  effort: string;
  description: string;
  criteria: string[];
}) {
  const priorityColors = {
    alta: 'bg-red-900/50 text-red-300 border-red-700',
    media: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    baja: 'bg-blue-900/50 text-blue-300 border-blue-700',
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-bold text-lg">{title}</h4>
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs rounded border ${priorityColors[priority]}`}>
            {priority.toUpperCase()}
          </span>
          <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
            {effort}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <div className="space-y-1">
        <p className="text-xs text-gray-500 font-semibold">Criterios de aceptación:</p>
        <ul className="text-xs text-gray-300 space-y-0.5">
          {criteria.map((criterion, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
