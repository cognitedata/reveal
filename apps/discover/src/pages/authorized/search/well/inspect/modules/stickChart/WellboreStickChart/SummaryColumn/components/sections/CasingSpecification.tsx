import { getCasingAverageLinearWeight } from 'domain/wells/casings/internal/selectors/getCasingAverageLinearWeight';
import { getCasingComponentsGrades } from 'domain/wells/casings/internal/selectors/getCasingComponentsGrades';
import { toReadableLinearWeight } from 'domain/wells/casings/internal/transformers/toReadableLinearWeight';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import { pluralize } from 'utils/pluralize';

import { Specification } from '../../../../components/Specification';
import { CasingAssemblyView, SummaryVisibilityProps } from '../../../../types';
import { getCasingSpecificationLabel } from '../../../../utils/getCasingSpecificationLabel';
import { SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';

interface CasingSpecificationProps extends SummaryVisibilityProps {
  casingAssembly: CasingAssemblyView;
}

export const CasingSpecification: React.FC<CasingSpecificationProps> = ({
  casingAssembly,
  isExpanded,
}) => {
  const { outsideDiameterFormatted, isLiner, components } = casingAssembly;

  return (
    <SummaryColumnSection
      name={getCasingSpecificationLabel(outsideDiameterFormatted, isLiner)}
      isExpanded={isExpanded}
    >
      <SummarySectionContent>
        <Specification label="OD" value={outsideDiameterFormatted} />
        <CasingSpecificationFromComponents components={components} />
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

  const averageLinearWeight = getCasingAverageLinearWeight(components);
  const averageLinearWeightReadable =
    averageLinearWeight && toReadableLinearWeight(averageLinearWeight);

  return (
    <>
      <Specification
        label={pluralize('Grade', grades)}
        value={grades.join(', ')}
      />
      <Specification label="Weight" value={averageLinearWeightReadable} />
    </>
  );
};
