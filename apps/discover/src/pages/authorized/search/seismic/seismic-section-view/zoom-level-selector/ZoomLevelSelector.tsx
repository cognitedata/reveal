import * as React from 'react';

import { MinusButton, PlusButton } from 'components/Buttons';

import { ZOOM_FACTOR } from '../constants';

import { ZoomLevelSelectorWrapper } from './elements';

interface Props {
  zoomLevel: number;
  onChange: (value: number) => void;
}

export const ZoomLevelSelector: React.FC<Props> = ({ zoomLevel, onChange }) => {
  const onIncrement = () => {
    onChange(zoomLevel + ZOOM_FACTOR);
  };

  const onDecrement = () => {
    const newZoomLevel = zoomLevel - ZOOM_FACTOR;
    if (newZoomLevel >= 1) {
      onChange(newZoomLevel);
    }
  };

  return (
    <ZoomLevelSelectorWrapper>
      <MinusButton size="small" onClick={onDecrement} />
      <PlusButton size="small" onClick={onIncrement} />
    </ZoomLevelSelectorWrapper>
  );
};
