import React from 'react';
import { Flex, IconType, Icon } from '@cognite/cogs.js';
import {
  ApplicationTileContainer,
  TileDescription,
  StyledTitle,
  ApplicationTileHeader,
  IconContainer as IconContainerWrapper,
} from 'components/tiles/elements';
import { ApplicationItem } from 'store/config/types';
import { useLastVisited } from 'hooks';
import IconContainer from 'components/icons';

interface Props {
  item: ApplicationItem;
}

const ApplicationTile: React.FC<Props> = ({ item }: Props) => {
  const { setAsLastvisited } = useLastVisited(item.key);

  return (
    <ApplicationTileContainer onClick={setAsLastvisited}>
      <ApplicationTileHeader>
        <Flex alignItems="center">
          <IconContainer
            type={item.iconKey as IconType}
            style={{ width: 32, height: 32 }}
          />
          <TileDescription>
            <StyledTitle level={6}>{item.title}</StyledTitle>
          </TileDescription>
        </Flex>
        <IconContainerWrapper>
          {item.rightIconKey && <Icon type={item.rightIconKey} />}
        </IconContainerWrapper>
      </ApplicationTileHeader>
    </ApplicationTileContainer>
  );
};

export default ApplicationTile;
