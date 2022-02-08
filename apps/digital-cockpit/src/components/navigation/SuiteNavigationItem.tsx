import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import { useLocation } from 'react-router-dom';
import SuiteAvatar from 'components/suiteAvatar/SuiteAvatar';
import { Suite } from 'store/suites/types';

import { NavigationItemContainer, NavigationItemTitle } from './elements';

interface Props {
  dataItem: Suite;
  isOpen?: boolean;
}

const SuiteNavigationItem: React.FC<Props> = ({ dataItem, isOpen }: Props) => {
  const location = useLocation();
  return (
    <NavigationItemContainer
      className="nav-item"
      selected={location?.pathname?.startsWith(`/suites/${dataItem.key}`)}
    >
      <Tooltip content={dataItem.title} placement="left" disabled={isOpen}>
        <SuiteAvatar color={dataItem.color} title={dataItem.title} />
      </Tooltip>
      <Tooltip content={dataItem.title}>
        <Body level={2} as={NavigationItemTitle} className="nav-item-text">
          {dataItem.title}
        </Body>
      </Tooltip>
      <NavigationItemTitle />
    </NavigationItemContainer>
  );
};

export default SuiteNavigationItem;
