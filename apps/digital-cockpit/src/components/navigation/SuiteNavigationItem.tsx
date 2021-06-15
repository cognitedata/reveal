import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import { useLocation } from 'react-router-dom';
import SuiteAvatar from 'components/suiteAvatar/SuiteAvatar';
import { Suite } from 'store/suites/types';
import { NavigationItemContainer, NavigationItemTitle } from './elements';

interface Props {
  dataItem: Suite;
}

const SuiteNavigationItem: React.FC<Props> = ({ dataItem }: Props) => {
  const location = useLocation();
  return (
    <NavigationItemContainer
      className="nav-item"
      selected={location?.pathname?.startsWith(`/suites/${dataItem.key}`)}
    >
      <SuiteAvatar color={dataItem.color} title={dataItem.title} />
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
