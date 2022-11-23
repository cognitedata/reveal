import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { pluralize } from 'utils/pluralize';

import { DepthMeasurementUnit } from 'constants/units';

import { SpecificationLabel } from '../../../../components/Specification';
import {
  HoleSectionView,
  SummarySection,
  SummaryVisibilityProps,
} from '../../../../types';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../../constants';
import { Depth, SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';
import { SummaryColumnSectionEmptyState } from '../SummaryColumnSectionEmptyState';

export interface HoleSectionSummaryProps extends SummaryVisibilityProps {
  holeSections: HoleSectionView[];
  depthMeasurementType?: DepthMeasurementUnit;
}

export const HoleSectionSummary: React.FC<HoleSectionSummaryProps> = ({
  holeSections,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  isExpanded,
}) => {
  if (isEmpty(holeSections)) {
    return (
      <SummaryColumnSectionEmptyState
        name={SummarySection.HoleSection}
        isExpanded={isExpanded}
      />
    );
  }

  const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

  return (
    <SummaryColumnSection
      name={pluralize(SummarySection.HoleSection, holeSections)}
      isExpanded={isExpanded}
    >
      {holeSections.map(
        ({
          id,
          holeSizeFormatted,
          topMeasuredDepth,
          baseMeasuredDepth,
          topTrueVerticalDepth,
          baseTrueVerticalDepth,
          depthUnit,
        }) => {
          const topDepth = isMdScale ? topMeasuredDepth : topTrueVerticalDepth;
          const baseDepth = isMdScale
            ? baseMeasuredDepth
            : baseTrueVerticalDepth;

          return (
            <React.Fragment key={id}>
              <SummarySectionContent>
                <SpecificationLabel label={`${holeSizeFormatted} Hole`} />
              </SummarySectionContent>
              <Depth>
                {topDepth}
                {depthUnit} - {baseDepth}
                {depthUnit}
              </Depth>
            </React.Fragment>
          );
        }
      )}
    </SummaryColumnSection>
  );
};
