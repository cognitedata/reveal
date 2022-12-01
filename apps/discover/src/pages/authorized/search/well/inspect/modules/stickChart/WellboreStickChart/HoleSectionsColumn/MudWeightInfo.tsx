import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

import { MudWeightData } from '../../types';
import { getMudWeightDataSummaries } from '../../utils/getMudWeightDataSummaries';

import { InfoIcon, MudWeightInfoWrapper, MudWeightType } from './elements';

export interface MudWeightInfoProps {
  mudWeights?: MudWeightData[];
}

export const MudWeightInfo: React.FC<MudWeightInfoProps> = ({ mudWeights }) => {
  const mudWeightDataSummaries = useDeepMemo(() => {
    if (!mudWeights || isEmpty(mudWeights)) {
      return EMPTY_ARRAY;
    }
    return getMudWeightDataSummaries(mudWeights);
  }, [mudWeights]);

  if (isEmpty(mudWeightDataSummaries)) {
    return null;
  }

  const Content = (
    <Menu>
      {mudWeightDataSummaries.map(
        ({ id, type, mudDensityRange: { min, max, unit } }) => {
          return (
            <MudWeightInfoWrapper key={id}>
              <MudWeightType>{type}</MudWeightType>
              <span>
                {min} - {max} {unit}
              </span>
            </MudWeightInfoWrapper>
          );
        }
      )}
    </Menu>
  );

  return (
    <Dropdown appendTo={document.body} placement="right" content={Content}>
      <InfoIcon type="Info" size={12} />
    </Dropdown>
  );
};
