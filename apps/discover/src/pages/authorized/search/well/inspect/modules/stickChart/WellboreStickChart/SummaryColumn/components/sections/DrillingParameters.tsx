import * as React from 'react';

import { SummarySection, SummaryVisibilityProps } from '../../../../types';
import { SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';

export type DrillingParametersProps = SummaryVisibilityProps;

export const DrillingParameters: React.FC<DrillingParametersProps> = ({
  isExpanded,
}) => {
  return (
    <SummaryColumnSection
      name={SummarySection.DrillingParameters}
      isExpanded={isExpanded}
    >
      <SummarySectionContent>
        Achieved 300 ft/hr with 200RPM / 50k WOB to BOS ECD 11.26-11.31 ppge
      </SummarySectionContent>

      <SummarySectionContent>
        After BOS: 1400GPM, 100-400ft/hr with 200RPM / 30k-60k WOM 11.64 ppge
        Max ECD 385 units of gas max
      </SummarySectionContent>
    </SummaryColumnSection>
  );
};
