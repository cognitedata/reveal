import React, { useState } from 'react';

import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import { BooleanMap } from 'utils/booleanMap';

import EmptyState from 'components/EmptyState';
import { NavigationPanel } from 'components/NavigationPanel';
import { OverlayNavigation } from 'components/OverlayNavigation';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { FlexGrow } from 'styles/layout';

import { MEASUREMENTS_UNIT_SELECTOR_OPTIONS } from '../config/measurementUnits';
import { CurveFilters, MeasurementUnitsSelector } from '../TopContent';
import {
  WellWellboreSelection,
  MeasurementsView,
  MeasurementUnits,
} from '../types';
import { adaptToChartDataCompareView } from '../utils/adaptToChartDataCompareView';
import { filterChartDataBySelection } from '../utils/filterChartDataBySelection';
import { getCurveFilterOptions } from '../utils/getCurveFilterOptions';
import { getWellboreSelectionInfo } from '../utils/getWellboreSelectionInfo';

import { CompareViewChart } from './CompareViewChart';
import { ContentWrapper, TopContentWrapper } from './elements';

export interface CompareViewProps {
  data: MeasurementsView[];
  isLoading: boolean;
  measurementUnits: MeasurementUnits;
  compareViewSelection: WellWellboreSelection;
  onBackClick: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  data,
  isLoading,
  measurementUnits: measurementUnitsCurrent,
  compareViewSelection,
  onBackClick,
}) => {
  const { title, subtitle } = getWellboreSelectionInfo(compareViewSelection);

  const [curveSelection, setCurveSelection] = useState<BooleanMap>({});
  const [measurementUnits, setMeasurementUnits] = useState(
    measurementUnitsCurrent
  );

  useDeepEffect(() => {
    setMeasurementUnits(measurementUnitsCurrent);
  }, [measurementUnitsCurrent]);

  const curveFilterOptions = useDeepMemo(
    () => getCurveFilterOptions(data),
    [data]
  );

  const chartData = useDeepMemo(
    () =>
      data.flatMap((wellboreMeasurementData) =>
        adaptToChartDataCompareView(wellboreMeasurementData, measurementUnits)
      ),
    [data, measurementUnits]
  );

  const chartDataSelected = useDeepMemo(
    () => filterChartDataBySelection(chartData, curveSelection),
    [chartData, curveSelection]
  );

  const { x: pressureChartData, x2: angleChartData } = useDeepMemo(
    () => groupBy(chartDataSelected, 'xaxis'),
    [chartData, curveSelection]
  );

  return (
    <OverlayNavigation mount>
      <NavigationPanel
        title={title}
        subtitle={subtitle}
        onBackClick={onBackClick}
      />

      <TopContentWrapper>
        <CurveFilters
          options={curveFilterOptions}
          onChange={setCurveSelection}
        />
        <FlexGrow />
        <MeasurementUnitsSelector
          options={MEASUREMENTS_UNIT_SELECTOR_OPTIONS}
          value={measurementUnits}
          onChange={setMeasurementUnits}
        />
      </TopContentWrapper>

      <ContentWrapper>
        {isEmpty(chartDataSelected) && (
          <EmptyState
            isLoading={isLoading}
            emptySubtitle="Select dropdown item to see graph"
          />
        )}

        <CompareViewChart
          title="Pore Pressure Fracture Gradient"
          data={pressureChartData}
          measurementUnits={measurementUnits}
        />

        <CompareViewChart
          title="Internal Friction Angle"
          data={angleChartData}
          measurementUnits={measurementUnits}
        />
      </ContentWrapper>
    </OverlayNavigation>
  );
};
