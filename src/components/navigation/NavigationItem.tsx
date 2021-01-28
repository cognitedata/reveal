import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import { useLocation } from 'react-router-dom';
import SuiteAvatar from 'components/suiteAvatar/SuiteAvatar';
import { Suite } from 'store/suites/types';
import { NavigationItemContainer, SuiteTitle } from './elements';

interface Props {
  dataItem: Suite;
}

const NavigationItem: React.FC<Props> = ({ dataItem }: Props) => {
  const location = useLocation();
  return (
    <NavigationItemContainer
      selected={location?.pathname?.startsWith(`/suites/${dataItem.key}`)}
    >
      <SuiteAvatar color={dataItem.color} title={dataItem.title} />
      <Tooltip content={dataItem.title}>
        <Body level={2} as={SuiteTitle}>
          {dataItem.title}
        </Body>
      </Tooltip>
      <SuiteTitle />
    </NavigationItemContainer>
  );
};

export default NavigationItem;
