import {
  NptCodeDefinitionType,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';

import * as React from 'react';

import { DepthMeasurementUnit } from 'constants/units';

import { DetailCardWrapper } from '../../../components/DetailCard/elements';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';

import { NptEventDetailCardContent } from './NptEventDetailCardContent';

export interface NptEventDetailCardProps {
  event: NptInternalWithTvd;
  nptCodeDefinitions: NptCodeDefinitionType;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const NptEventDetailCard: React.FC<NptEventDetailCardProps> = ({
  event,
  nptCodeDefinitions,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
}) => {
  return (
    <DetailCardWrapper>
      <NptEventDetailCardContent
        event={event}
        nptCodeDefinitions={nptCodeDefinitions}
        depthMeasurementType={depthMeasurementType}
      />
    </DetailCardWrapper>
  );
};
