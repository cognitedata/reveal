import React from 'react';

interface GaugeProps {
  percentage: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  size?: number;
}
export const Gauge: React.FC<GaugeProps> = ({
  percentage,
  strokeWidth = 9,
  showPercentage = true,
  size = 62,
}) => {
  const [animatedPercentage, setAnimatedPercentage] = React.useState(0);
  const radius = (size - strokeWidth) / 2;
  const center = radius + strokeWidth / 2;
  const circleLength = 2 * radius * Math.PI;

  if (percentage < 0 || percentage > 100) {
    console.error(
      'Percentage exceeds bounds. The number should be between or equal to 0 and 100.'
    );
  }

  React.useEffect(() => {
    // Slightly delay the percentage update so that
    // CSS has time to render and trigger the animation
    setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 10);
  }, [percentage]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        strokeWidth={strokeWidth}
        stroke="rgba(51, 51, 51, 0.08)"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={strokeWidth}
        stroke="#4cc968"
        fill="transparent"
        strokeLinecap="round"
        strokeDasharray={`${circleLength} ${circleLength}`}
        strokeDashoffset={((100 - animatedPercentage) * circleLength) / 100}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      {showPercentage && (
        <text
          x="50%"
          y={center + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14px"
          fill="rgba(0, 0, 0, 0.45)"
        >
          {percentage}%
        </text>
      )}
    </svg>
  );
};
