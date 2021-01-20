import React from 'react';
import { Overline, Tooltip } from '@cognite/cogs.js';
import { Flex } from 'styles/common';
import {
  TileHeader,
  TileDescription,
  LargeTileContainer,
  LargeTilePreview,
  StyledTitle,
} from '../elements';

interface Props {
  color?: string;
}

export const InfographicsTile: React.FC<Props> = ({ color }: Props) => {
  return (
    <LargeTileContainer>
      <TileHeader color={color} isBoard>
        <Flex>
          <TileDescription>
            <Overline level={3}>Infographics</Overline>
            <Tooltip content="UC2">
              <StyledTitle level={6}>UC2</StyledTitle>
            </Tooltip>
          </TileDescription>
        </Flex>
      </TileHeader>
      <LargeTilePreview>
        <iframe
          src="https://grafana-noc-test.cognite.ai/d-solo/I4v5JABMz/valeriia-board?orgId=1&panelId=2&&kiosk"
          width="944"
          height="568"
          frameBorder="0"
          title="uc2"
        />
      </LargeTilePreview>
    </LargeTileContainer>
  );
};
