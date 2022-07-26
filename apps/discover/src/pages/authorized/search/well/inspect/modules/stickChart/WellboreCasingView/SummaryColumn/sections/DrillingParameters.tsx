import React from 'react';

import { BodyColumnMainHeader } from '../../../../common/Events/elements';
import { SummarySection, SummarySectionContent } from '../elements';

export const DrillingParameters: React.FC = () => {
  return (
    <SummarySection>
      <BodyColumnMainHeader>Drilling Parameters</BodyColumnMainHeader>

      <SummarySectionContent>
        Achieved 300 ft/hr with 200RPM / 50k WOB to BOS ECD 11.26-11.31 ppge
      </SummarySectionContent>

      <SummarySectionContent>
        After BOS: 1400GPM, 100-400ft/hr with 200RPM / 30k-60k WOM 11.64 ppge
        Max ECD 385 units of gas max
      </SummarySectionContent>
    </SummarySection>
  );
};
