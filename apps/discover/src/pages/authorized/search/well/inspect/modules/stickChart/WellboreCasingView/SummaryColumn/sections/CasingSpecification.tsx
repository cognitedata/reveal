import React from 'react';

import { BodyColumnMainHeader } from '../../../../common/Events/elements';
import { SummarySection, SummarySectionContent } from '../elements';

interface CasingSpecificationProps {
  casingDiameter: number;
}

export const CasingSpecification: React.FC<CasingSpecificationProps> = ({
  casingDiameter,
}) => {
  return (
    <SummarySection>
      <BodyColumnMainHeader>
        {`${casingDiameter}" Casing specification`}
      </BodyColumnMainHeader>

      <SummarySectionContent>
        13,570 VAM SLIJ-II, 115.00ppf, 0.812”. 12.376” ID, 12.250” drift, VM
        125HC, 13.050b, 12.640c
      </SummarySectionContent>
    </SummarySection>
  );
};
