import * as React from 'react';

import { FlexRow } from 'styles/layout';

import { BodyColumnMainHeader } from '../../../../common/Events/elements';
import { NptEventAvatar } from '../../elements';
import {
  EventText,
  SecondaryText,
  SummarySection,
  SummarySectionContent,
} from '../elements';

export const HighlightEvent: React.FC = () => {
  return (
    <SummarySection>
      <BodyColumnMainHeader>Highlight Event</BodyColumnMainHeader>

      <SummarySectionContent>{`FIT 19.311' to 15 ppg`}</SummarySectionContent>
      <SecondaryText>9/1/2021</SecondaryText>

      <FlexRow>
        <NptEventAvatar color="#87E79C" />
        <EventText>DFAL MOTR 2036 (ft)</EventText>
      </FlexRow>
    </SummarySection>
  );
};
