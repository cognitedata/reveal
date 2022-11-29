import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { FlexColumn } from 'styles/layout';

import { WellboreData, WellboreStickChartData } from '../../types';

import { RigNames } from './components/RigNames';
import { TotalDrillingDays } from './components/TotalDrillingDays';
import {
  HeaderData,
  HeaderWrapper,
  WellboreUBI,
  WellboreName,
  WellName,
} from './elements';

interface HeaderProps
  extends Pick<
      WellboreData,
      | 'wellName'
      | 'wellboreName'
      | 'totalDrillingDays'
      | 'uniqueWellboreIdentifier'
    >,
    Pick<WellboreStickChartData, 'rigNames'> {}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  totalDrillingDays,
  uniqueWellboreIdentifier,
  rigNames,
}) => {
  return (
    <HeaderWrapper>
      <FlexColumn>
        <HeaderData>
          <WellName>{wellName}</WellName>
          {!isEmpty(uniqueWellboreIdentifier) && (
            <WellboreUBI>{`(${uniqueWellboreIdentifier})`}</WellboreUBI>
          )}
        </HeaderData>

        <HeaderData>
          <WellboreName>{wellboreName}</WellboreName>
          <RigNames rigNames={rigNames} />
          <TotalDrillingDays totalDrillingDays={totalDrillingDays} />
        </HeaderData>
      </FlexColumn>
    </HeaderWrapper>
  );
};
