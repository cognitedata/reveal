import { NumberInput } from '@cognite/cogs.js';
import { useEffect, useState } from 'react';

import * as S from './elements';
import { ControlProps } from './types';

export const TextControl: React.FC<ControlProps> = ({ instance, nodes }) => {
  const [fontSize, setFontSize] = useState(nodes[0].attrs.fontSize);

  useEffect(() => {
    setFontSize(nodes[0].attrs.fontSize);
  }, [nodes]);

  const handleFontChange = (nextSize: number) => {
    nodes.forEach((n) => {
      n.setAttr('fontSize', nextSize);
    });
    setFontSize(nextSize);
    instance.emitSaveEvent();
  };

  // NEXT: Cog number input is terri-bad and doesn't work well. Its works for now, but should be improved
  return (
    <S.TextControlWrapper>
      <NumberInput
        step={4}
        value={fontSize}
        setValue={handleFontChange}
        min={9}
        max={128}
      />
    </S.TextControlWrapper>
  );
};
