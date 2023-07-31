import * as React from 'react';

const getGradient = (
  startColor: string,
  middleColor: string,
  endColor: string
) => {
  if (middleColor) {
    return `linear-gradient(to bottom, ${startColor} 0%, ${middleColor} 50%, ${endColor} 100%)`;
  }
  return `linear-gradient(to bottom, ${startColor} 0%, ${endColor} 100%)`;
};

interface Props {
  startColor: string;
  middleColor: string;
  endColor: string;
}

export const ColorScale: React.FC<Props> = (props) => {
  const { startColor, middleColor, endColor } = props;

  return (
    <div
      style={{
        background: getGradient(startColor, middleColor, endColor),
        width: 16,
        height: 'auto',
      }}
    />
  );
};
