import React from 'react';

import { BodyColumnMainHeader } from '../../../../common/Events/elements';
import { CasingAssemblyView } from '../../../types';
import { SummarySection, SummarySectionContent } from '../elements';

type HoleDepthProps = Pick<CasingAssemblyView, 'measuredDepthBase'>;

export const HoleDepth: React.FC<HoleDepthProps> = ({ measuredDepthBase }) => {
  const { value, unit } = measuredDepthBase;

  const unitDisplay = unit === 'ft' ? `'` : unit;

  return (
    <SummarySection>
      <BodyColumnMainHeader>Hole depth (NTH)</BodyColumnMainHeader>

      <SummarySectionContent>{`${value}${unitDisplay} MD`}</SummarySectionContent>
    </SummarySection>
  );
};
