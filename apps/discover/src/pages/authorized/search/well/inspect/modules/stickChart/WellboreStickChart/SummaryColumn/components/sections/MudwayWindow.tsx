import * as React from 'react';

import { SummarySection, SummaryVisibilityProps } from '../../../../types';
import { Depth, SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';

export type HighlightEventProps = SummaryVisibilityProps;

export const MudwayWindow: React.FC<HighlightEventProps> = ({ isExpanded }) => {
  return (
    <SummaryColumnSection
      name={SummarySection.MudwayWindow}
      isExpanded={isExpanded}
    >
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
    </SummaryColumnSection>
  );
};
