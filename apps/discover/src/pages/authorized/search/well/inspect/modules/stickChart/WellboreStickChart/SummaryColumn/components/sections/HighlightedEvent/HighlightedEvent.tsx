import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

import * as React from 'react';
import { useEffect, useState } from 'react';

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
  isExpanded: isExpandedProp,
}) => {
  const [isExpanded, setExpanded] = useState(isExpandedProp);

  /**
   * We need this additional state to keep the highlighted event section expanded.
   * When the empty state is rendered, the actual view is unmounted.
   * Since the user can interact with highlighting events,
   * the section is collpased once the last event is removed,
   * or first event is highlighted while expanded.
   * So, keeping this common state here solves the issue.
   */
  useEffect(() => {
    setExpanded(isExpandedProp);
  }, [isExpandedProp]);

  const allEvents = [...nptEvents, ...ndsEvents];

  if (isEmpty(allEvents)) {
    return (
      <SummaryColumnSectionEmptyState
        name={SummarySection.HighlightedEvent}
        emptyText={
          noEventHighlighted ? NO_EVENT_HIGHLIGHTED_TEXT : NO_DATA_TEXT
        }
        isExpanded={isExpanded}
        onToggleExpand={setExpanded}
      />
    );
  }

  return (
    <SummaryColumnSection
      name={pluralize(SummarySection.HighlightedEvent, allEvents)}
      isExpanded={isExpanded}
      onToggleExpand={setExpanded}
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
