import * as React from 'react';

import { Body, Menu } from '@cognite/cogs.js';

import { CasingAssemblyView } from '../../../../../types';
import { visualizeDistance } from '../../../../../utils/visualizeDistance';
import { TooptipSection } from '../elements';

export const TooltipContent: React.FC<CasingAssemblyView> = ({
  measuredDepthTop,
  measuredDepthBase,
  trueVerticalDepthTop,
  trueVerticalDepthBase,
  isLiner,
  cementing,
}) => {
  const assemblyType = isLiner ? 'Liner' : 'Casing';

  return (
    <Menu>
      <TooptipSection>
        <Title>Assembly Type:</Title>
        <Content>{assemblyType}</Content>
      </TooptipSection>

      <TooptipSection>
        <Title>Depth (MD):</Title>
        <Content>Top Depth (MD): {visualizeDistance(measuredDepthTop)}</Content>
        <Content>
          Bottom Depth (MD): {visualizeDistance(measuredDepthBase)}
        </Content>
      </TooptipSection>

      <TooptipSection>
        <Title>Depth (TVD):</Title>
        <Content>
          Top Depth (TVD): {visualizeDistance(trueVerticalDepthTop)}
        </Content>
        <Content>
          Bottom Depth (TVD): {visualizeDistance(trueVerticalDepthBase)}
        </Content>
      </TooptipSection>

      <TooptipSection>
        <Title>Cement Depth (MD):</Title>
        <Content>
          Top Depth (MD): {visualizeDistance(cementing?.topMeasuredDepth)}
        </Content>
        <Content>
          Bottom Depth (MD): {visualizeDistance(cementing?.baseMeasuredDepth)}
        </Content>
      </TooptipSection>

      <TooptipSection>
        <Title>Cement Depth (TVD):</Title>
        <Content>
          Top Depth (TVD): {visualizeDistance(cementing?.topTrueVerticalDepth)}
        </Content>
        <Content>
          Bottom Depth (TVD):{' '}
          {visualizeDistance(cementing?.baseTrueVerticalDepth)}
        </Content>
      </TooptipSection>
    </Menu>
  );
};

const Title: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Body level={3} strong>
      {children}
    </Body>
  );
};

const Content: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Body level={3}>{children}</Body>;
};
