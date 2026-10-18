import { useEffect, useState, useRef } from 'react';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);
  const onCompleteRef = useRef(onComplete);
  
  // Mantener la referencia actualizada sin causar re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (count === 0) {
      // Mostrar "GO!" por 1 segundo antes de completar
      const timeout = setTimeout(() => {
        onCompleteRef.current();
      }, 1000);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="text-9xl font-bold text-white animate-pulse drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
        {count > 0 ? count : 'GO!'}
      </div>
    </div>
  );
}
