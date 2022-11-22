import { getCasingAverageLinearWeight } from 'domain/wells/casings/internal/selectors/getCasingAverageLinearWeight';
import { getCasingComponentsGrades } from 'domain/wells/casings/internal/selectors/getCasingComponentsGrades';
import { getCasingThickness } from 'domain/wells/casings/internal/selectors/getCasingThickness';
import { formatDiameter } from 'domain/wells/casings/internal/transformers/formatDiameter';
import { toReadableLinearWeight } from 'domain/wells/casings/internal/transformers/toReadableLinearWeight';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { pluralize } from 'utils/pluralize';

import { Specification } from '../../../../components/Specification';
import {
  CasingAssemblyView,
  SummarySection,
  SummaryVisibilityProps,
} from '../../../../types';
import { SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';

interface CasingSpecificationProps extends SummaryVisibilityProps {
  casingAssembly: CasingAssemblyView;
}

export const CasingSpecification: React.FC<CasingSpecificationProps> = ({
  casingAssembly,
  isExpanded,
}) => {
  const { outsideDiameterFormatted, components } = casingAssembly;

  const thickness = getCasingThickness(casingAssembly);

  return (
    <SummaryColumnSection
      name={`${outsideDiameterFormatted} ${SummarySection.CasingSpecification}`}
      isExpanded={isExpanded}
    >
      <SummarySectionContent>
        <Specification label="Casing size" value={outsideDiameterFormatted} />
        <CasingSpecificationFromComponents components={components} />
        <Specification label="Thickness" value={formatDiameter(thickness)} />
      </SummarySectionContent>
    </SummaryColumnSection>
  );
};

const CasingSpecificationFromComponents: React.FC<
  Pick<CasingAssemblyView, 'components'>
> = ({ components }) => {
  if (!components || isEmpty(components)) {
    return null;
  }

  const grades = getCasingComponentsGrades(components);

  const averageLinerWeight = getCasingAverageLinearWeight(components);
  const averageLinerWeightReadable =
    averageLinerWeight && toReadableLinearWeight(averageLinerWeight);

  return (
    <>
      <Specification
        label={pluralize('Grade', grades)}
        value={grades.join(', ')}
      />
      <Specification label="Linear weight" value={averageLinerWeightReadable} />
    </>
  );
};
