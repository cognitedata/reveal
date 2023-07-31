import { DrillingDays } from 'domain/wells/wellbore/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { FlexColumn } from 'styles/layout';

import { WellboreData, WellboreStickChartData } from '../../types';

import { RigNames } from './components/RigNames';
import { TotalDrillingDays } from './components/TotalDrillingDays';
import { WellboreDrillingDays } from './components/WellboreDrillingDays';
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
      'wellName' | 'wellboreName' | 'uniqueWellboreIdentifier'
    >,
    Pick<WellboreStickChartData, 'rigNames'> {
  drillingDaysData?: DrillingDays;
}

export const Header: React.FC<HeaderProps> = ({
  wellName,
  wellboreName,
  uniqueWellboreIdentifier,
  rigNames,
  drillingDaysData,
}) => {
  return (
    <HeaderWrapper>
      <FlexColumn>
        <HeaderData>
          <WellName>{wellName}</WellName>
          {!isEmpty(uniqueWellboreIdentifier) && (
            <WellboreUBI>{`(${uniqueWellboreIdentifier})`}</WellboreUBI>
          )}
          <TotalDrillingDays days={drillingDaysData?.cumulativeTotal} />
        </HeaderData>

        <HeaderData>
          <WellboreName>{wellboreName}</WellboreName>
          <RigNames rigNames={rigNames} />
          <WellboreDrillingDays days={drillingDaysData?.wellbore} />
        </HeaderData>
      </FlexColumn>
    </HeaderWrapper>
  );
};
