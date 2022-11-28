import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { pluralize } from 'utils/pluralize';

import { DepthMeasurementUnit } from 'constants/units';

import { SpecificationLabel } from '../../../../components/Specification';
import { EventSpecification } from '../../../../components/Specification/EventSpecification';
import { SummarySection, SummaryVisibilityProps } from '../../../../types';
import { NO_DATA_TEXT, NO_EVENT_HIGHLIGHTED_TEXT } from '../../../constants';
import { SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';
import { SummaryColumnSectionEmptyState } from '../SummaryColumnSectionEmptyState';

export interface HighlightedEventProps extends SummaryVisibilityProps {
  nptEvents: NptInternalWithTvd[];
  ndsEvents: NdsInternalWithTvd[];
  noEventHighlighted?: boolean;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const HighlightedEvent: React.FC<HighlightedEventProps> = ({
  nptEvents,
  ndsEvents,
  noEventHighlighted = false,
  depthMeasurementType,
  isExpanded,
}) => {
  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  const allEvents = [...nptEvents, ...ndsEvents];

  if (isEmpty(allEvents)) {
    return (
      <SummaryColumnSectionEmptyState
        name={SummarySection.HighlightedEvent}
        emptyText={
          noEventHighlighted ? NO_EVENT_HIGHLIGHTED_TEXT : NO_DATA_TEXT
        }
        isExpanded={isExpanded}
      />
    );
  }

  return (
    <SummaryColumnSection
      name={pluralize(SummarySection.HighlightedEvent, allEvents)}
      isExpanded={isExpanded}
    >
      {!isEmpty(nptEvents) && (
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
      )}

      {!isEmpty(ndsEvents) && (
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
              if (!riskType) {
                return null;
              }

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
      )}
    </SummaryColumnSection>
  );
};
