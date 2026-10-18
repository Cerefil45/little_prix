/**
 * TouchControls - Controles táctiles para móvil
 * Overlay de botones sobre el canvas de Phaser.
 */

import { useCallback, useRef, useEffect } from 'react';
import type { InputState } from '../../game/systems/MovementSystem';

interface TouchControlsProps {
  inputRef: React.MutableRefObject<InputState>;
  disabled?: boolean;
  hasItem?: boolean;
  onUseItem?: () => void;
}

export function TouchControls({ inputRef, disabled = false, hasItem = false, onUseItem }: TouchControlsProps) {
  const activeTouches = useRef<Map<number, string>>(new Map());

  // Limpiar todos los inputs
  const clearAll = useCallback(() => {
    inputRef.current = {
      accelerating: false,
      braking: false,
      steerLeft: false,
      steerRight: false,
      drifting: false,
    };
    activeTouches.current.clear();
  }, [inputRef]);

  // Limpiar al desmontar o desactivar
  useEffect(() => {
    if (disabled) {
      clearAll();
    }
  }, [disabled, clearAll]);

  // Limpiar al perder el foco de la ventana
  useEffect(() => {
    const handleBlur = () => clearAll();
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [clearAll]);

  const handleTouchStart = useCallback((action: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      activeTouches.current.set(touch.identifier, action);
    }
    updateInput(action, true);
  }, [disabled]);

  const handleTouchEnd = useCallback((action: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      activeTouches.current.delete(touch.identifier);
    }

    // Verificar si algún otro toque mantiene esta acción
    const stillActive = Array.from(activeTouches.current.values()).includes(action);
    if (!stillActive) {
      updateInput(action, false);
    }
  }, [disabled]);

  const updateInput = (action: string, active: boolean) => {
    switch (action) {
      case 'accelerate':
        inputRef.current.accelerating = active;
        break;
      case 'brake':
        inputRef.current.braking = active;
        break;
      case 'left':
        inputRef.current.steerLeft = active;
        break;
      case 'right':
        inputRef.current.steerRight = active;
        break;
      case 'drift':
        inputRef.current.drifting = active;
        break;
    }
  };

  // Mouse fallback para escritorio
  const handleMouseDown = useCallback((action: string) => () => {
    if (disabled) return;
    updateInput(action, true);
  }, [disabled]);

  const handleMouseUp = useCallback((action: string) => () => {
    if (disabled) return;
    updateInput(action, false);
  }, [disabled]);

  if (disabled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-20"
      style={{ touchAction: 'none' }}>
      {/* Zona inferior del screen */}
      <div className="flex justify-between items-end p-3 pb-6 md:pb-8">

        {/* Controles izquierdos: Dirección */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/15 border-2 border-white/30
              flex items-center justify-center text-white text-2xl font-bold
              active:bg-white/30 transition-colors select-none"
            onTouchStart={handleTouchStart('left')}
            onTouchEnd={handleTouchEnd('left')}
            onTouchCancel={handleTouchEnd('left')}
            onMouseDown={handleMouseDown('left')}
            onMouseUp={handleMouseUp('left')}
            onMouseLeave={handleMouseUp('left')}
            aria-label="Girar izquierda"
          >
            ◀
          </button>
          <button
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/15 border-2 border-white/30
              flex items-center justify-center text-white text-2xl font-bold
              active:bg-white/30 transition-colors select-none"
            onTouchStart={handleTouchStart('right')}
            onTouchEnd={handleTouchEnd('right')}
            onTouchCancel={handleTouchEnd('right')}
            onMouseDown={handleMouseDown('right')}
            onMouseUp={handleMouseUp('right')}
            onMouseLeave={handleMouseUp('right')}
            aria-label="Girar derecha"
          >
            ▶
          </button>
        </div>

        {/* Controles derechos: Acelerar + Drift + Item */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto">
          {/* Botón de usar item (solo visible si tiene item) */}
          {hasItem && onUseItem && (
            <button
              className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-purple-500/40 border-2 border-purple-400/60
                flex items-center justify-center text-white text-2xl
                active:bg-purple-500/60 transition-colors select-none animate-pulse"
              onTouchStart={(e) => {
                e.preventDefault();
                onUseItem();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                onUseItem();
              }}
              aria-label="Usar item"
            >
              ⚡
            </button>
          )}
          <button
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-orange-500/30 border-2 border-orange-400/50
              flex items-center justify-center text-white text-xs font-bold
              active:bg-orange-500/50 transition-colors select-none"
            onTouchStart={handleTouchStart('drift')}
            onTouchEnd={handleTouchEnd('drift')}
            onTouchCancel={handleTouchEnd('drift')}
            onMouseDown={handleMouseDown('drift')}
            onMouseUp={handleMouseUp('drift')}
            onMouseLeave={handleMouseUp('drift')}
            aria-label="Derrapar"
          >
            DRIFT
          </button>
          <button
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-500/30 border-2 border-green-400/50
              flex items-center justify-center text-white text-lg font-bold
              active:bg-green-500/50 transition-colors select-none"
            onTouchStart={handleTouchStart('accelerate')}
            onTouchEnd={handleTouchEnd('accelerate')}
            onTouchCancel={handleTouchEnd('accelerate')}
            onMouseDown={handleMouseDown('accelerate')}
            onMouseUp={handleMouseUp('accelerate')}
            onMouseLeave={handleMouseUp('accelerate')}
            aria-label="Acelerar"
          >
            GAS
          </button>
        </div>
      </div>
    </div>
  );
}
