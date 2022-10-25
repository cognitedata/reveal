import * as React from 'react';

import { FlexColumn } from 'styles/layout';

import { WellboreData, WellboreStickChartData } from '../../types';

import { RigNames } from './components/RigNames';
import { TotalDrillingDays } from './components/TotalDrillingDays';
import { HeaderData, HeaderWrapper, WellboreName, WellName } from './elements';

interface HeaderProps
  extends Pick<WellboreData, 'wellName' | 'wellboreName' | 'totalDrillingDays'>,
    Pick<WellboreStickChartData, 'rigNames'> {}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  totalDrillingDays,
  rigNames,
}) => {
  return (
    <HeaderWrapper>
      <FlexColumn>
        <WellName>{wellName}</WellName>

        <HeaderData>
          <WellboreName>{wellboreName}</WellboreName>
          <RigNames rigNames={rigNames} />
          <TotalDrillingDays totalDrillingDays={totalDrillingDays} />
        </HeaderData>
      </FlexColumn>
    </HeaderWrapper>
  );
};
