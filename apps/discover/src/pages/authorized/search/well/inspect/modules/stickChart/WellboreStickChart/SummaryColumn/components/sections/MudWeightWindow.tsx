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
import { adaptDepthMeasurementToMudWeight } from '../../../../utils/adaptDepthMeasurementToMudWeight';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../../constants';
import { Depth, SummarySectionContent } from '../../elements';
import { SummaryColumnSection } from '../SummaryColumnSection';
import { SummaryColumnSectionEmptyState } from '../SummaryColumnSectionEmptyState';

export interface MudWeightWindowProps extends SummaryVisibilityProps {
  measurementsData: DepthMeasurementWithData[];
  depthMeasurementType?: DepthMeasurementUnit;
}

export const MudWeightWindow: React.FC<MudWeightWindowProps> = ({
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

    return adaptDepthMeasurementToMudWeight(depthMeasurements);
  }, [measurementsData]);

  const mudWeightsTVD = useDeepMemo(() => {
    const depthMeasurements = head(
      filterTvdIndexedDepthMeasurements(measurementsData)
    );

    if (!depthMeasurements) {
      return EMPTY_ARRAY;
    }

    return adaptDepthMeasurementToMudWeight(depthMeasurements);
  }, [measurementsData]);

  const mudWeights =
    depthMeasurementType === DepthMeasurementUnit.MD
      ? mudWeightsMD
      : mudWeightsTVD;

  if (isEmpty(mudWeights)) {
    return (
      <SummaryColumnSectionEmptyState
        name={SummarySection.MudWeightWindow}
        isExpanded={isExpanded}
      />
    );
  }

  return (
    <SummaryColumnSection
      name={SummarySection.MudWeightWindow}
      isExpanded={isExpanded}
    >
      {mudWeights.map(({ id, type, value, depth }) => {
        return (
          <React.Fragment key={id}>
            <SummarySectionContent>
              <Specification
                label={type}
                value={`${value.value}${value.unit}`}
              />
            </SummarySectionContent>
            <Depth>{`${depth.value}${depth.unit}`}</Depth>
          </React.Fragment>
        );
      })}
    </SummaryColumnSection>
  );
};
