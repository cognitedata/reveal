import React from 'react';

import { Body, Menu } from '@cognite/cogs.js';

import { TooptipSection } from './elements';

interface Props {
  assemblyType: string;
  topDepthMD: number | string;
  bottomDepthMD: number | string;
  topDepthTVD?: number | string;
  bottomDepthTVD?: number | string;
  depthUnit: string;
}

export const TooltipContent: React.FC<Props> = ({
  assemblyType,
  topDepthMD,
  bottomDepthMD,
  topDepthTVD,
  bottomDepthTVD,
  depthUnit,
}) => {
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
        <Body level={3}>Top Depth (MD): {`${topDepthMD} ${depthUnit}`}</Body>
        <Body level={3}>
          Bottom Depth (MD): {`${bottomDepthMD} ${depthUnit}`}
        </Body>
      </TooptipSection>

      <TooptipSection>
        <Body level={3} strong>
          Depth (TVD):
        </Body>
        <Body level={3}>
          Top Depth (TVD): {topDepthTVD ? `${topDepthTVD} ${depthUnit}` : 'N/A'}
        </Body>
        <Body level={3}>
          Bottom Depth (TVD):{' '}
          {bottomDepthTVD ? `${bottomDepthTVD} ${depthUnit}` : 'N/A'}
        </Body>
      </TooptipSection>
    </Menu>
  );
};
