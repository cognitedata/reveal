import React from 'react';
import { Body, Graphic, Tooltip } from '@cognite/cogs.js';
import { ApplicationItem } from 'store/config/types';
import { NavigationItemContainer, NavigationItemTitle } from './elements';

interface Props {
  item: ApplicationItem;
}

const ApplicationNavigationItem: React.FC<Props> = ({ item }: Props) => (
  <NavigationItemContainer>
    <Graphic type={item.iconKey} style={{ width: '32px' }} />
    <Tooltip content={item.title}>
      <Body level={2} as={NavigationItemTitle}>
        {item.title}
      </Body>
    </Tooltip>
    <NavigationItemTitle />
  </NavigationItemContainer>
);

export default ApplicationNavigationItem;
