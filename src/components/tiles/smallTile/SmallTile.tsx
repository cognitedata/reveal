import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import {
  SmallTileContainer,
  TileDescription,
  StyledTitle,
} from 'components/tiles/elements';
import { shortDateTime } from '_helpers/date';
import { Suite } from 'store/suites/types';

interface Props {
  dataItem: Suite;
}

export const SmallTile: React.FC<Props> = ({ dataItem }: Props) => {
  return (
    <SmallTileContainer>
      <SuiteAvatar size="large" title={dataItem.title} color={dataItem.color} />
      <TileDescription>
        <Tooltip content={dataItem.title}>
          <StyledTitle level={6}>{dataItem.title}</StyledTitle>
        </Tooltip>
        <Body level={3}>Opened {shortDateTime(dataItem?.lastUpdatedTime)}</Body>
      </TileDescription>
    </SmallTileContainer>
  );
};
