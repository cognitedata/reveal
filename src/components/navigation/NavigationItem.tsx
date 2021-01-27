import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar/SuiteAvatar';
import { NavigationItemContainer, SuiteTitle } from './elements';

interface Props {
  title: string;
  disabled?: boolean;
  color: string;
  selected?: boolean;
}

const NavigationItem: React.FC<Props> = ({
  color,
  title,
  disabled,
  selected,
}: Props) => (
  <NavigationItemContainer selected={selected}>
    <SuiteAvatar color={color} title={title} disabled={disabled} />
    <Tooltip content={title}>
      <Body level={2} as={SuiteTitle}>
        {title}
      </Body>
    </Tooltip>
    <SuiteTitle disabled={disabled} />
  </NavigationItemContainer>
);

export default NavigationItem;
