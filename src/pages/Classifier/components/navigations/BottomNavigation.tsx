import { Button } from '@cognite/cogs.js';
import React, { FC } from 'react';
import styled from 'styled-components';

const Content = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const NavigationBackButton = styled(Button).attrs({
  type: 'ghost',
  icon: 'ArrowLeft',
})``;

export const NavigationNextButton = styled(Button).attrs({
  type: 'primary',
  icon: 'ArrowRight',
  iconPlacement: 'right',
})``;

export interface ClassifierNavigationProps {
  disabled?: boolean;
}

export const BottomNavigation: FC = ({ children }) => {
  return <Content>{children}</Content>;
};
