import React from 'react';
import { Body } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar/SuiteAvatar';
import { NavigationItemContainer, SuiteTitle } from './elements';

interface Props {
  title: string;
  disabled?: boolean;
  color: string;
}

const NavigationItem: React.FC<Props> = ({ color, title, disabled }: Props) => {
  return (
    <NavigationItemContainer>
      <SuiteAvatar color={color} title={title} disabled={disabled} />
      <Body level={2} as={SuiteTitle}>
        {title}
      </Body>
      <SuiteTitle disabled={disabled} />
    </NavigationItemContainer>
  );
};

export default NavigationItem;
