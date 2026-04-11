const DotsOverlay = () => {
  const dots = [];
  const spacing = 18;
  const opacity = 0.3;
  
  // Create a 6x6 grid of dots
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      dots.push(
        <circle
          key={`${i}-${j}`}
          cx={2 + (j * spacing)}
          cy={2 + (i * spacing)}
          r="1"
          fill="white"
          fillOpacity={opacity}
        />
      );
    }
  }

  return (
    <div className="absolute inset-0 opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern
          id="dots"
          x="0"
          y="0"
          width="36"
          height="36"
          patternUnits="userSpaceOnUse"
        >
          {dots}
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
};

export default DotsOverlay;