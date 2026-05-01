import { useEffect, useState } from 'react';

export function TypingIndicator() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
      }}
    >
      {/* Bouncing dots bubble */}
      <div
        style={{
          background: '#1e2a3d',
          borderRadius: '18px 18px 18px 4px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#8b9dc3',
              opacity: dots > i ? 1 : 0.3,
              transition: 'opacity 0.2s',
            }}
          />
        ))}
      </div>
      <span style={{ color: '#8b9dc3', fontSize: 12 }}>Elena is typing...</span>
    </div>
  );
}
