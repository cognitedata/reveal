import React from 'react';
import { Flex, Graphic, Icon } from '@cognite/cogs.js';
import {
  ApplicationTileContainer,
  TileDescription,
  StyledTitle,
  ApplicationTileHeader,
  IconContainer,
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
        <Flex alignItems="center">
          <Graphic type={item.iconKey} style={{ width: '32px' }} />
          <TileDescription>
            <StyledTitle level={6}>{item.title}</StyledTitle>
          </TileDescription>
        </Flex>
        <IconContainer>
          {item.rightIconKey && <Icon type={item.rightIconKey} />}
        </IconContainer>
      </ApplicationTileHeader>
    </ApplicationTileContainer>
  );
};

export default ApplicationTile;
