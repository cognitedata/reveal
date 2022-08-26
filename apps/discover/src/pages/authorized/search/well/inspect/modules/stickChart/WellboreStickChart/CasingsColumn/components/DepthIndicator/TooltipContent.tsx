import * as React from 'react';

import isUndefined from 'lodash/isUndefined';

import { Body, Menu } from '@cognite/cogs.js';

import { CasingAssemblyView } from '../../../../types';

import { TooptipSection } from './elements';

export const TooltipContent: React.FC<CasingAssemblyView> = ({
  measuredDepthTop,
  measuredDepthBase,
  trueVerticalDepthTop,
  trueVerticalDepthBase,
  isLiner,
}) => {
  const assemblyType = isLiner ? 'Liner' : 'Casing';

  return (
    <Menu>
      <TooptipSection>
        <Body level={3} strong>
          Assembly Type:
        </Body>
        <Body level={3}>{assemblyType}</Body>
      </TooptipSection>

      <TooptipSection>
        <Body level={3} strong>
          Depth (MD):
        </Body>
        <Body level={3}>
          Top Depth (MD): {`${measuredDepthTop.value} ${measuredDepthTop.unit}`}
        </Body>
        <Body level={3}>
          Bottom Depth (MD):{' '}
          {`${measuredDepthBase.value} ${measuredDepthBase.unit}`}
        </Body>
      </TooptipSection>

      <TooptipSection>
        <Body level={3} strong>
          Depth (TVD):
        </Body>
        <Body level={3}>
          Top Depth (TVD):{' '}
          {isUndefined(trueVerticalDepthTop)
            ? 'N/A'
            : `${trueVerticalDepthTop.value} ${trueVerticalDepthTop.unit}`}
        </Body>
        <Body level={3}>
          Bottom Depth (TVD):{' '}
          {isUndefined(trueVerticalDepthBase)
            ? 'N/A'
            : `${trueVerticalDepthBase.value} ${trueVerticalDepthBase.unit}`}
        </Body>
      </TooptipSection>
    </Menu>
  );
};
