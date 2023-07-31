import { filterMdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterMdIndexedDepthMeasurements';
import { filterTvdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterTvdIndexedDepthMeasurements';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { SpecificationLabel } from '../../../../components/Specification';
import { SummarySection, SummaryVisibilityProps } from '../../../../types';
import { adaptDepthMeasurementToMudWeights } from '../../../../utils/adaptDepthMeasurementToMudWeights';
import { getMudWeightDataSummaries } from '../../../../utils/getMudWeightDataSummaries';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../../constants';
import { SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';
import { SummaryColumnSectionEmptyState } from '../SummaryColumnSectionEmptyState';

export interface MudWeightProps extends SummaryVisibilityProps {
  data: DepthMeasurementWithData[];
  depthMeasurementType?: DepthMeasurementUnit;
}

export const MudWeight: React.FC<MudWeightProps> = ({
  data,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  isExpanded,
}) => {
  const mudWeightsMD = useDeepMemo(() => {
    const mudType = head(filterMdIndexedDepthMeasurements(data));

    if (!mudType) {
      return EMPTY_ARRAY;
    }

    return adaptDepthMeasurementToMudWeights(mudType);
  }, [data]);

  const mudWeightsTVD = useDeepMemo(() => {
    const mudType = head(filterTvdIndexedDepthMeasurements(data));

    if (!mudType) {
      return EMPTY_ARRAY;
    }

    return adaptDepthMeasurementToMudWeights(mudType);
  }, [data]);

  const mudWeightDataSummariesMD = useDeepMemo(() => {
    return getMudWeightDataSummaries(mudWeightsMD);
  }, [mudWeightsMD]);

  const mudWeightDataSummariesTVD = useDeepMemo(() => {
    return getMudWeightDataSummaries(mudWeightsTVD);
  }, [mudWeightsTVD]);

  const mudWeightDataSummaries =
    depthMeasurementType === DepthMeasurementUnit.MD
      ? mudWeightDataSummariesMD
      : mudWeightDataSummariesTVD;

  if (isEmpty(mudWeightDataSummaries)) {
    return (
      <SummaryColumnSectionEmptyState
        name={SummarySection.MudWeight}
        isExpanded={isExpanded}
      />
    );
  }

  return (
    <SummaryColumnSection
      name={SummarySection.MudWeight}
      isExpanded={isExpanded}
    >
      {mudWeightDataSummaries.map(
        ({ id, type, mudDensityRange: { min, max, unit } }) => {
          return (
            <SummarySectionContent key={id}>
              <SpecificationLabel label={type} />
              <span>
                {min} - {max} {unit}
              </span>
            </SummarySectionContent>
          );
        }
      )}
    </SummaryColumnSection>
  );
};
