import React from 'react';

import { AllIconTypes } from '@cognite/cogs.js';

import { TmpLabel, Content } from './elements';

export type Color = 'Danger' | 'Success' | 'Secondary' | 'Normal' | 'Info';
type iconPlacement = 'left' | 'right';

interface Props {
  iconplacement?: iconPlacement;
  onClick?: (event: Event) => void;
  color?: Color;
  icon?: AllIconTypes;
  children: React.ReactElement | string;
}
export const Label: React.FC<Props> = (props) => {
  const {
    iconplacement = 'left',
    color = 'Secondary',
    children,
    onClick,
  } = props;

  return (
    <TmpLabel
      onClick={onClick}
      iconplacement={iconplacement}
      color={color}
      {...props}
    >
      <Content>{children}</Content>
    </TmpLabel>
  );
};
