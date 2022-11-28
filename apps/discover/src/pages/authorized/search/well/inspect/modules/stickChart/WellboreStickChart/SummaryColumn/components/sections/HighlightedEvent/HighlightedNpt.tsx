import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { DepthMeasurementUnit } from 'constants/units';

import { SpecificationLabel } from '../../../../../components/Specification';
import { EventSpecification } from '../../../../../components/Specification/EventSpecification';
import { SummaryVisibilityProps } from '../../../../../types';
import { SummarySectionContent } from '../../../elements';

export interface HighlightedNptProps extends SummaryVisibilityProps {
  nptEvents: NptInternalWithTvd[];
  depthMeasurementType?: DepthMeasurementUnit;
}

export const HighlightedNpt: React.FC<HighlightedNptProps> = ({
  nptEvents,
  depthMeasurementType,
}) => {
  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  if (isEmpty(nptEvents)) {
    return null;
  }

  return (
    <SummarySectionContent>
      <SpecificationLabel label="NPT" />
      {nptEvents.map(
        ({
          source,
          nptCodeColor,
          nptCode,
          nptCodeDetail,
          measuredDepth,
          trueVerticalDepth,
        }) => {
          const depth = isMdScale ? measuredDepth : trueVerticalDepth;

          return (
            <EventSpecification
              key={`npt-${source.eventExternalId}`}
              color={nptCodeColor}
              label={`${nptCode} ${nptCodeDetail}`}
              depth={depth && `${depth?.value}${depth?.unit}`}
            />
          );
        }
      )}
    </SummarySectionContent>
  );
};
