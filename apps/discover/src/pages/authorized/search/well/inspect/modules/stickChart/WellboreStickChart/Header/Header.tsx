import * as React from 'react';

import { FlexColumn } from 'styles/layout';

import { HeaderExtraData } from '../../types';

import { RigNames } from './components/RigNames';
import { HeaderData, HeaderWrapper, WellboreName, WellName } from './elements';

interface HeaderProps extends HeaderExtraData {
  wellName: string;
  wellboreName: string;
}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  rigNames,
}) => {
  return (
    <HeaderWrapper>
      <FlexColumn>
        <WellName>{wellName}</WellName>

        <HeaderData>
          <WellboreName>{wellboreName}</WellboreName>
          <RigNames rigNames={rigNames} />
        </HeaderData>
      </FlexColumn>
    </HeaderWrapper>
  );
};
