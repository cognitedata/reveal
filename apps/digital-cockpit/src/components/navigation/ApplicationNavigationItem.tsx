import React from 'react';
import { Body, IconType, Tooltip } from '@cognite/cogs.js';
import { ApplicationItem } from 'store/config/types';
import { useLastVisited } from 'hooks';
import IconContainer from 'components/icons';

import { NavigationItemContainer, NavigationItemTitle } from './elements';

interface Props {
  item: ApplicationItem;
  isOpen?: boolean;
}

const ApplicationNavigationItem: React.FC<Props> = ({
  item,
  isOpen,
}: Props) => {
  const { setAsLastvisited } = useLastVisited(item.key);
  return (
    <NavigationItemContainer className="nav-item" onClick={setAsLastvisited}>
      <Tooltip content={item.title} placement="left" disabled={isOpen}>
        <IconContainer
          type={item.iconKey as IconType}
          style={{ width: 32, height: 32 }}
        />
      </Tooltip>
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
