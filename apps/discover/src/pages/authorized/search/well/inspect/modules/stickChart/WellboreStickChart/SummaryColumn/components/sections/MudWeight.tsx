import { filterMdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterMdIndexedDepthMeasurements';
import { filterTvdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterTvdIndexedDepthMeasurements';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import * as React from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { Specification } from '../../../../components/Specification';
import { SummarySection, SummaryVisibilityProps } from '../../../../types';
import { adaptDepthMeasurementToMudWeights } from '../../../../utils/adaptDepthMeasurementToMudWeights';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../../constants';
import { Depth, SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';
import { SummaryColumnSectionEmptyState } from '../SummaryColumnSectionEmptyState';

export interface MudWeightProps extends SummaryVisibilityProps {
  measurementsData: DepthMeasurementWithData[];
  depthMeasurementType?: DepthMeasurementUnit;
}

export const MudWeight: React.FC<MudWeightProps> = ({
  measurementsData,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  isExpanded,
}) => {
  const mudWeightsMD = useDeepMemo(() => {
    const depthMeasurements = head(
      filterMdIndexedDepthMeasurements(measurementsData)
    );

    if (!depthMeasurements) {
      return EMPTY_ARRAY;
    }

    return adaptDepthMeasurementToMudWeights(depthMeasurements);
  }, [measurementsData]);

  const mudWeightsTVD = useDeepMemo(() => {
    const depthMeasurements = head(
      filterTvdIndexedDepthMeasurements(measurementsData)
    );

    if (!depthMeasurements) {
      return EMPTY_ARRAY;
    }

    return adaptDepthMeasurementToMudWeights(depthMeasurements);
  }, [measurementsData]);

  const mudWeights =
    depthMeasurementType === DepthMeasurementUnit.MD
      ? mudWeightsMD
      : mudWeightsTVD;

  if (isEmpty(mudWeights)) {
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
      {mudWeights.map(({ id, type, value, depth }) => {
        return (
          <SummarySectionContent key={id}>
            <Specification label={type} value={`${value.value}${value.unit}`} />
            <Depth>
              {depth.value}
              {depth.unit}
            </Depth>
          </SummarySectionContent>
        );
      })}
    </SummaryColumnSection>
  );
};
