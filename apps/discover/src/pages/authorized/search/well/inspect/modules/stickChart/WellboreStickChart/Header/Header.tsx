import * as React from 'react';

import { FlexColumn } from 'styles/layout';

import { HeaderWrapper, WellboreName, WellName } from './elements';

interface HeaderProps {
  wellName: string;
  wellboreName: string;
}

export const Header: React.FC<HeaderProps> = ({ wellName, wellboreName }) => {
  return (
    <HeaderWrapper>
      <FlexColumn>
        <WellName>{wellName}</WellName>
        <WellboreName>{wellboreName}</WellboreName>
      </FlexColumn>
    </HeaderWrapper>
  );
};
