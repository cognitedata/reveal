import * as React from 'react';

import { getStringPixelWidth } from 'utils/getStringPixelWidth';

import { Tooltip } from 'components/PopperTooltip';

import { TOOLTIP_PLACEMENT } from '../constants';
import { FormationColumnBlockText, FormationLayerBlock } from '../elements';

export interface FormationLayerProps {
  name: string;
  scaledTop: number;
  scaledHeight: number;
  color: string;
}

export const FormationLayer: React.FC<FormationLayerProps> = ({
  name,
  scaledTop,
  scaledHeight,
  color,
}) => {
  /**
   * We show the layer name inside the box,
   * only if it fits inside.
   * Otherwise just showing a tooltip.
   */
  const nameWidth = getStringPixelWidth(name);
  const isFitting = nameWidth < scaledHeight;

  return (
    <Tooltip
      key={name}
      followCursor
      content={name}
      placement={TOOLTIP_PLACEMENT}
      disabled={isFitting}
    >
      <FormationLayerBlock
        top={scaledTop}
        height={scaledHeight}
        color={color}
        $overflow={!isFitting}
      >
        {isFitting && (
          <FormationColumnBlockText>{name}</FormationColumnBlockText>
        )}
      </FormationLayerBlock>
    </Tooltip>
  );
};
