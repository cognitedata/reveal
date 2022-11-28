import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { DepthMeasurementUnit } from 'constants/units';

import { SpecificationLabel } from '../../../../../components/Specification';
import { EventSpecification } from '../../../../../components/Specification/EventSpecification';
import { SummaryVisibilityProps } from '../../../../../types';
import { SummarySectionContent } from '../../../elements';

export interface HighlightedNdsProps extends SummaryVisibilityProps {
  ndsEvents: NdsInternalWithTvd[];
  depthMeasurementType?: DepthMeasurementUnit;
}

export const HighlightedNds: React.FC<HighlightedNdsProps> = ({
  ndsEvents,
  depthMeasurementType,
}) => {
  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  if (isEmpty(ndsEvents)) {
    return null;
  }

  return (
    <SummarySectionContent>
      <SpecificationLabel label="NDS" />

      {ndsEvents.map(
        ({
          source,
          ndsCodeColor,
          riskType,
          subtype,
          holeTop,
          holeTopTvd,
          holeBase,
          holeBaseTvd,
        }) => {
          const depthTop = isMdScale ? holeTop : holeTopTvd;
          const depthBase = isMdScale ? holeBase : holeBaseTvd;

          const depth =
            depthTop &&
            depthBase &&
            `${depthTop.value}${depthTop.unit} - ${depthBase.value}${depthBase.unit}`;

          return (
            <EventSpecification
              key={`nds-${source.eventExternalId}`}
              color={ndsCodeColor}
              label={`${riskType} ${subtype && `| ${subtype}`}`}
              depth={depth}
            />
          );
        }
      )}
    </SummarySectionContent>
  );
};
