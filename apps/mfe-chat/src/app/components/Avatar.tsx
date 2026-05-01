interface AvatarProps {
  initials: string;
  bg: string;
  size?: number;
  isOnline?: boolean;
  hasGradientRing?: boolean;
}

export function Avatar({
  initials,
  bg,
  size = 48,
  isOnline = false,
  hasGradientRing = false,
}: AvatarProps) {
  const fontSize = size <= 32 ? 11 : size <= 40 ? 13 : 15;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {hasGradientRing && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4d7af6, #a855f7)',
            zIndex: 0,
          }}
        />
      )}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize,
          letterSpacing: '0.5px',
          position: 'relative',
          zIndex: 1,
          border: hasGradientRing ? '2px solid #131929' : 'none',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      {isOnline && (
        <div
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid #131929',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}
