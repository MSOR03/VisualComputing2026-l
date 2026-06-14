const panel = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  background: 'rgba(2, 4, 18, 0.82)',
  border: '1px solid #00ffff',
  borderRadius: '10px',
  padding: '18px 22px',
  color: '#00ffff',
  fontFamily: "'Courier New', monospace",
  fontSize: '13px',
  minWidth: '230px',
  backdropFilter: 'blur(6px)',
  userSelect: 'none',
}

const btn = {
  background: 'transparent',
  border: '1px solid #00ffff',
  color: '#00ffff',
  padding: '6px 14px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: "'Courier New', monospace",
  fontSize: '12px',
  width: '100%',
  textAlign: 'left',
  marginBottom: '6px',
  letterSpacing: '0.04em',
}

const hint = {
  marginTop: '14px',
  color: '#336666',
  fontSize: '11px',
  lineHeight: '1.65',
}

export default function UIPanel({
  dayMode,     onDayToggle,
  gridVisible, onGridToggle,
  animPaused,  onAnimToggle,
}) {
  return (
    <div style={panel}>
      <div style={{ marginBottom: '12px', color: '#ffffff', fontSize: '15px', fontWeight: 'bold', letterSpacing: '0.08em' }}>
        CIUDAD FUTURISTA 2077
      </div>

      <div style={{ color: '#446666', fontSize: '11px', marginBottom: '14px' }}>
        Haz clic en un dron para activarlo / desactivarlo
      </div>

      <button style={btn} onClick={onDayToggle}>
        {dayMode ? '[ D ] → MODO NOCHE' : '[ D ] → MODO DÍA'}
      </button>
      <button style={btn} onClick={onGridToggle}>
        {gridVisible ? '[ G ] → OCULTAR GRID' : '[ G ] → MOSTRAR GRID'}
      </button>
      <button style={btn} onClick={onAnimToggle}>
        {animPaused ? '[ P ] → REANUDAR' : '[ P ] → PAUSAR ANIM.'}
      </button>

      <div style={hint}>
        Arrastrar  → rotar cámara<br />
        Scroll     → zoom<br />
        Clic dcho  → paneo
      </div>
    </div>
  )
}
