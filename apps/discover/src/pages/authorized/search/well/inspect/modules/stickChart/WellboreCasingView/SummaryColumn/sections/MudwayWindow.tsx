import React from 'react';

import { BodyColumnMainHeader } from '../../../../common/Events/elements';
import { Depth, SummarySection, SummarySectionContent } from '../elements';

export const MudwayWindow: React.FC = () => {
  return (
    <SummarySection>
      <BodyColumnMainHeader>Mudway window</BodyColumnMainHeader>

      <SummarySectionContent>
        FG = 14.2 ppg, Drilled out with 11.0ppg SMW, 12.15 ppg EDS for PIT 13.6
        ppge DHMW PIT achieved
      </SummarySectionContent>
      <Depth>30 meter</Depth>

      <SummarySectionContent>12.6 ppge Max ECDs</SummarySectionContent>
      <Depth>60 meter</Depth>

      <SummarySectionContent>
        Performed OHPIT to 12.97 ppge DHMW. Weight up system to 12.4 ppfg SMW
      </SummarySectionContent>
      <Depth>90 meter</Depth>

      <SummarySectionContent>Up to 13.0 ppge Max ECDs</SummarySectionContent>
      <Depth>200 meter</Depth>
    </SummarySection>
  );
};
