import * as React from 'react';

import { SummarySection, SummaryVisibilityProps } from '../../../../types';
import { SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';

interface CasingSpecificationProps extends SummaryVisibilityProps {
  casingDiameter: number;
}

export const CasingSpecification: React.FC<CasingSpecificationProps> = ({
  casingDiameter,
  isExpanded,
}) => {
  return (
    <SummaryColumnSection
      name={`${casingDiameter}" ${SummarySection.CasingSpecification}`}
      isExpanded={isExpanded}
    >
      <SummarySectionContent>
        13,570 VAM SLIJ-II, 115.00ppf, 0.812”. 12.376” ID, 12.250” drift, VM
        125HC, 13.050b, 12.640c
      </SummarySectionContent>
    </SummaryColumnSection>
  );
};
