import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import * as React from 'react';

import { DepthMeasurementUnit } from 'constants/units';

import { DetailCardWrapper } from '../../../components/DetailCard/elements';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';

import { NdsEventDetailCardContent } from './NdsEventDetailCardContent';

export interface NdsEventDetailCardProps {
  event: NdsInternalWithTvd;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const NdsEventDetailCard: React.FC<NdsEventDetailCardProps> = ({
  event,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
}) => {
  return (
    <DetailCardWrapper>
      <NdsEventDetailCardContent
        event={event}
        depthMeasurementType={depthMeasurementType}
      />
    </DetailCardWrapper>
  );
};
