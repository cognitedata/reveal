import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { pluralize } from 'utils/pluralize';

import { DepthMeasurementUnit } from 'constants/units';

import { SummarySection, SummaryVisibilityProps } from '../../../../../types';
import { NO_DATA_TEXT, NO_EVENT_HIGHLIGHTED_TEXT } from '../../../../constants';
import { SummaryColumnSection } from '../../SummaryColumnSection';
import { SummaryColumnSectionEmptyState } from '../../SummaryColumnSectionEmptyState';

import { HighlightedNds } from './HighlightedNds';
import { HighlightedNpt } from './HighlightedNpt';

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
      <HighlightedNds
        ndsEvents={ndsEvents}
        depthMeasurementType={depthMeasurementType}
      />
      <HighlightedNpt
        nptEvents={nptEvents}
        depthMeasurementType={depthMeasurementType}
      />
    </SummaryColumnSection>
  );
};
