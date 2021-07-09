import React from 'react';
import { Body, Graphic, Tooltip } from '@cognite/cogs.js';
import { ApplicationItem } from 'store/config/types';
import { useLastVisited } from 'hooks';
import { NavigationItemContainer, NavigationItemTitle } from './elements';

interface Props {
  item: ApplicationItem;
}

const ApplicationNavigationItem: React.FC<Props> = ({ item }: Props) => {
  const { setAsLastvisited } = useLastVisited(item.key);
  return (
    <NavigationItemContainer className="nav-item" onClick={setAsLastvisited}>
      <Graphic
        type={item.iconKey}
        style={{ width: '32px' }}
        title={item.title}
      />
      <Tooltip content={item.title}>
        <Body level={2} as={NavigationItemTitle} className="nav-item-text">
          {item.title}
        </Body>
      </Tooltip>
      <NavigationItemTitle />
    </NavigationItemContainer>
  );
};

export default ApplicationNavigationItem;
