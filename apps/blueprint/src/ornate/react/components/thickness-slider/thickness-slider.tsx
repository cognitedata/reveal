import { Button } from '@cognite/cogs.js';

import { ThicknessOption, ThicknessSliderWrapper } from './elements';

export const ThicknessSlider = ({
  thickness,
  onThicknessChange,
  color,
}: {
  thickness: number;
  onThicknessChange: (next: number) => void;
  color: string;
}) => {
  const THICKNESS_OPTIONS = [8, 12, 16, 20, 24];
  const handlePlus = () => {
    onThicknessChange(thickness + 4);
  };
  const handleMinus = () => {
    onThicknessChange(Math.max(0, thickness - 4));
  };
  return (
    <ThicknessSliderWrapper>
      <Button type="link" icon="Minus" size="small" onClick={handleMinus} />
      {THICKNESS_OPTIONS.map((opt) => (
        <ThicknessOption
          key={opt}
          $thickness={opt}
          $isSelected={thickness === opt}
          $color={color || 'grey'}
          onClick={() => {
            onThicknessChange(opt);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onThicknessChange(opt);
            }
          }}
          tabIndex={0}
        />
      ))}
      <Button type="link" icon="Plus" size="small" onClick={handlePlus} />
    </ThicknessSliderWrapper>
  );
};
