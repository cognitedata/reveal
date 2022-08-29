import * as React from 'react';

import { visualizeDistanceUnit } from 'utils/units/visualizeDistanceUnit';

import {
  CasingAssemblyView,
  SummarySection,
  SummaryVisibilityProps,
} from '../../../../types';
import { SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';

type HoleDepthProps = Pick<CasingAssemblyView, 'measuredDepthBase'> &
  SummaryVisibilityProps;

export const HoleDepth: React.FC<HoleDepthProps> = ({
  measuredDepthBase,
  isExpanded,
}) => {
  const { value, unit } = measuredDepthBase;

  const unitVisualized = visualizeDistanceUnit(unit);

  return (
    <SummaryColumnSection
      name={SummarySection.HoleDepth}
      isExpanded={isExpanded}
    >
      <SummarySectionContent>{`${value}${unitVisualized} MD`}</SummarySectionContent>
    </SummaryColumnSection>
  );
};
