import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { MudWeightData } from '../../types';

import {
  InfoIcon,
  MugWeightInfo,
  MugWeightType,
  MugWeightValue,
} from './elements';

export interface MudWeightInfoProps {
  mudWeights?: MudWeightData[];
}

export const MudWeightInfo: React.FC<MudWeightInfoProps> = ({ mudWeights }) => {
  if (!mudWeights || isEmpty(mudWeights)) {
    return null;
  }

  const Content = (
    <Menu>
      {mudWeights.map(({ id, type, value: { value, unit } }) => {
        return (
          <MugWeightInfo key={id}>
            <MugWeightType>{type}</MugWeightType>
            <MugWeightValue>
              {value} {unit}
            </MugWeightValue>
          </MugWeightInfo>
        );
      })}
    </Menu>
  );

  return (
    <Dropdown appendTo={document.body} placement="right" content={Content}>
      <InfoIcon type="Info" size={12} />
    </Dropdown>
  );
};
