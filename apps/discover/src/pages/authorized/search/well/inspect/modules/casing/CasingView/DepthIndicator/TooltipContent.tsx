import React from 'react';

import isUndefined from 'lodash/isUndefined';

import { Body, Menu } from '@cognite/cogs.js';

import { PreviewCasingType } from 'modules/wellSearch/types';

import { TooptipSection } from './elements';

export const TooltipContent: React.FC<PreviewCasingType> = ({
  linerCasing,
  startDepth,
  endDepth,
  startDepthTVD,
  endDepthTVD,
  depthUnit,
}) => {
  const assemblyType = linerCasing ? 'Liner' : 'Casing';

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
        <Body level={3}>Top Depth (MD): {`${startDepth} ${depthUnit}`}</Body>
        <Body level={3}>Bottom Depth (MD): {`${endDepth} ${depthUnit}`}</Body>
      </TooptipSection>

      <TooptipSection>
        <Body level={3} strong>
          Depth (TVD):
        </Body>
        <Body level={3}>
          Top Depth (TVD):{' '}
          {isUndefined(startDepthTVD) ? 'N/A' : `${startDepthTVD} ${depthUnit}`}
        </Body>
        <Body level={3}>
          Bottom Depth (TVD):{' '}
          {isUndefined(endDepthTVD) ? 'N/A' : `${endDepthTVD} ${depthUnit}`}
        </Body>
      </TooptipSection>
    </Menu>
  );
};
