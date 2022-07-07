import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { NoDataAvailable } from 'components/Charts/common/NoDataAvailable';
import { Loading } from 'components/Loading';
import { PressureUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import {
  MeasurementChartData,
  MeasurementType,
} from 'modules/wellSearch/types';

import { useMeasurementsData } from '../hooks/useMeasurementsData';
import {
  filterByChartType,
  filterByMainChartType,
  formatChartData,
  mapToCurveCentric,
} from '../utils';

import CurveCentricCard from './CurveCentricCard';
import { CurveCentricViewWrapper } from './elements';

export type Props = {
  geomechanicsCurves: DepthMeasurementDataColumnInternal[];
  ppfgCurves: DepthMeasurementDataColumnInternal[];
  otherTypes: DepthMeasurementDataColumnInternal[];
  pressureUnit: PressureUnit;
  measurementReference: string;
};

export const CurveCentricView: React.FC<Props> = ({
  geomechanicsCurves,
  ppfgCurves,
  otherTypes,
  pressureUnit,
  measurementReference,
}) => {
  const dispatch = useDispatch();

  const { data, groupedData, isLoading } = useMeasurementsData();

  const selectedInspectWellbores = useWellInspectSelectedWellbores();

  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const [charts, setCharts] = useState<MeasurementChartData[]>([]);

  const [chartRendering, setChartRendering] = useState<boolean>(false);

  const updateChartData = useCallback(() => {
    if (isUndefined(data) || !userPreferredUnit) return;
    const wellboreChartData = selectedInspectWellbores
      .map((wellbore) => ({
        wellbore,
        proccessedData: formatChartData(
          groupedData[wellbore.id],
          geomechanicsCurves,
          ppfgCurves,
          otherTypes,
          pressureUnit,
          userPreferredUnit
        ),
      }))
      .map(({ wellbore, proccessedData }) => {
        if (!isEmpty(proccessedData.errors)) {
          dispatch(
            inspectTabsActions.setErrors({
              [wellbore.matchingId || '']: proccessedData.errors,
            })
          );
        }
        return {
          wellbore,
          chartData: proccessedData.chartData,
        };
      })
      .map(({ wellbore, chartData }) => mapToCurveCentric(chartData, wellbore));
    setCharts(flatten(wellboreChartData));
  }, [
    JSON.stringify(data),
    isLoading,
    selectedInspectWellbores,
    pressureUnit,
    geomechanicsCurves,
    ppfgCurves,
    measurementReference,
    otherTypes,
    userPreferredUnit,
  ]);

  useEffect(() => {
    setChartRendering(true);
    // Use timeout to display loader before app get freezed with chart rendering
    const timer = setTimeout(() => {
      updateChartData();
      setTimeout(() => {
        // Use timeout to avoid hiding loader before chart renders
        setChartRendering(false);
      }, 100);
    }, 1000);
    return () => clearTimeout(timer);
  }, [updateChartData]);

  const wellCards = useMemo(() => {
    const axisNames = {
      x: `Pressure (${pressureUnit.toLowerCase()})`,
      x2: 'Angle (deg)',
      y: `${measurementReference} (${userPreferredUnit})`,
    };

    const geomechanicsCharts = filterByChartType(charts, [
      MeasurementType.GEOMECHANNICS,
    ]);
    const groupedGeomechanicsData = groupBy(
      filterByMainChartType(geomechanicsCharts),
      'name'
    );
    const ppfgCharts = filterByChartType(charts, [MeasurementType.PPFG]);
    const groupedPPFGData = groupBy(filterByMainChartType(ppfgCharts), 'name');

    // 2D array logic is implemented to divide geomechanics and ppfgs in to two columns
    const charts2DArray = Object.keys(groupedGeomechanicsData).map((key) => [
      <CurveCentricCard
        key={key}
        chartData={groupedGeomechanicsData[key]}
        axisNames={axisNames}
        measurementType={MeasurementType.GEOMECHANNICS}
      />,
    ]);

    Object.keys(groupedPPFGData).forEach((key, index) => {
      if (charts2DArray[index]) {
        charts2DArray[index].push(
          <CurveCentricCard
            key={key}
            chartData={groupedPPFGData[key]}
            axisNames={axisNames}
            measurementType={MeasurementType.PPFG}
          />
        );
      } else {
        charts2DArray.push([
          <CurveCentricCard
            key={key}
            chartData={groupedPPFGData[key]}
            axisNames={axisNames}
            measurementType={MeasurementType.PPFG}
          />,
        ]);
      }
    });

    const groupedCharts = flatten(charts2DArray);

    const fitCharts = filterByChartType(charts, [MeasurementType.FIT]);
    if (!isEmpty(fitCharts)) {
      groupedCharts.push(
        <CurveCentricCard
          key="FIT"
          chartData={fitCharts}
          axisNames={axisNames}
          measurementType={MeasurementType.FIT}
        />
      );
    }

    const lotCharts = filterByChartType(charts, [MeasurementType.LOT]);
    if (!isEmpty(lotCharts)) {
      groupedCharts.push(
        <CurveCentricCard
          key="LOT"
          chartData={lotCharts}
          axisNames={axisNames}
          measurementType={MeasurementType.LOT}
        />
      );
    }
    return groupedCharts;
  }, [charts, pressureUnit, measurementReference, userPreferredUnit]);

  if (chartRendering) {
    return <Loading />;
  }

  if (!chartRendering && isEmpty(wellCards)) return <NoDataAvailable />;

  return (
    <>
      <CurveCentricViewWrapper visible={!chartRendering}>
        {wellCards}
      </CurveCentricViewWrapper>
    </>
  );
};

export default CurveCentricView;
