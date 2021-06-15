import React from 'react';
import { Graphic, Tooltip } from '@cognite/cogs.js';
import {
  ApplicationTileContainer,
  TileDescription,
  StyledTitle,
  ApplicationTileHeader,
} from 'components/tiles/elements';
import { ApplicationItem } from 'store/config/types';
import { useLastVisited } from 'hooks';

interface Props {
  item: ApplicationItem;
}

const ApplicationTile: React.FC<Props> = ({ item }: Props) => {
  const { setAsLastvisited } = useLastVisited(item.key);

  return (
    <ApplicationTileContainer onClick={setAsLastvisited}>
      <ApplicationTileHeader>
        <Graphic type={item.iconKey} style={{ width: '32px' }} />
        <TileDescription>
          <Tooltip content={item.title}>
            <StyledTitle level={6}>{item.title}</StyledTitle>
          </Tooltip>
        </TileDescription>
      </ApplicationTileHeader>
    </ApplicationTileContainer>
  );
};

export default ApplicationTile;
