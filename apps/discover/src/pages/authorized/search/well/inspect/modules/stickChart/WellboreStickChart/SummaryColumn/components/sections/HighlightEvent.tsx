import * as React from 'react';

import { FlexRow } from 'styles/layout';

import { SummarySection, SummaryVisibilityProps } from '../../../../types';
import { NptEventAvatar } from '../../../elements';
import {
  EventText,
  SecondaryText,
  SummarySectionContent,
} from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';

export type HighlightEventProps = SummaryVisibilityProps;

export const HighlightEvent: React.FC<HighlightEventProps> = ({
  isExpanded,
}) => {
  return (
    <SummaryColumnSection
      name={SummarySection.HighlightedEvent}
      isExpanded={isExpanded}
    >
      <SummarySectionContent>{`FIT 19.311' to 15 ppg`}</SummarySectionContent>
      <SecondaryText>9/1/2021</SecondaryText>

      <FlexRow>
        <NptEventAvatar color="#87E79C" />
        <EventText>DFAL MOTR 2036 (ft)</EventText>
      </FlexRow>
    </SummaryColumnSection>
  );
};
