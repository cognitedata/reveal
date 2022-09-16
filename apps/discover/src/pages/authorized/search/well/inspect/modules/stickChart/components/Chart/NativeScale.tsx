import * as React from 'react';

import { ScaleLineDepth } from '../../../common/Events/elements';

import { NativeScaleWrapper } from './elements';

export interface NativeScaleProps {
  scaleBlocks: number[];
}

export const NativeScale: React.FC<NativeScaleProps> = ({ scaleBlocks }) => {
  return (
    <NativeScaleWrapper>
      {scaleBlocks.map((scaleValue) => {
        return <ScaleLineDepth key={scaleValue}>{scaleValue}</ScaleLineDepth>;
      })}
    </NativeScaleWrapper>
  );
};
