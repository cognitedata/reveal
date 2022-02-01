import React, { useEffect, useMemo, useState } from 'react';

import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import isUndefined from 'lodash/isUndefined';

import { Loading } from 'components/loading';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWellbores } from 'modules/wellInspect/hooks/useWellInspect';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import {
  MeasurementChartData,
  MeasurementType,
} from 'modules/wellSearch/types';

import {
  filterByChartType,
  filterByMainChartType,
  formatChartData,
  mapToCurveCentric,
} from '../utils';

import CurveCentricCard from './CurveCentricCard';
import { CurveCentricViewWrapper } from './elements';

type Props = {
  geomechanicsCurves: string[];
  ppfgCurves: string[];
  otherTypes: string[];
  pressureUnit: string;
  measurementReference: string;
};

export const CurveCentricView: React.FC<Props> = ({
  geomechanicsCurves,
  ppfgCurves,
  otherTypes,
  pressureUnit,
  measurementReference,
}) => {
  const { data, isLoading } = useMeasurementsQuery();

  const { data: config } = useWellConfig();

  const selectedInspectWellbores = useWellInspectSelectedWellbores();

  const userPreferredUnit = useUserPreferencesMeasurement();

  const [charts, setCharts] = useState<MeasurementChartData[]>([]);

  const [chartRendering, setChartRendering] = useState<boolean>(false);

  const updateChartData = () => {
    if (isUndefined(data)) return;
    const wellboreChartData = selectedInspectWellbores.map((wellbore) => {
      const chartData = formatChartData(
        data[wellbore.id],
        geomechanicsCurves,
        ppfgCurves,
        otherTypes,
        measurementReference,
        pressureUnit.toLowerCase(),
        userPreferredUnit,
        config
      );
      return mapToCurveCentric(chartData, wellbore);
    });
    setCharts(flatten(wellboreChartData));
  };

  useEffect(() => {
    setChartRendering(true);
    // Use timeout to display loader before app get freezed with chart rendering
    setTimeout(() => {
      updateChartData();
      setTimeout(() => {
        // Use timeout to avoid hiding loader before chart renders
        setChartRendering(false);
      }, 100);
    }, 1000);
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

  const wellCards = useMemo(() => {
    const axisNames = {
      x: `Pressure (${pressureUnit.toLowerCase()})`,
      x2: 'Angle (deg)',
      y: `${measurementReference} (${userPreferredUnit})`,
    };

    const geomechanicsCharts = filterByChartType(charts, [
      MeasurementType.geomechanic,
    ]);
    const groupedGeomechanicsData = groupBy(
      filterByMainChartType(geomechanicsCharts),
      'name'
    );
    const ppfgCharts = filterByChartType(charts, [MeasurementType.ppfg]);
    const groupedPPFGData = groupBy(filterByMainChartType(ppfgCharts), 'name');

    // 2D array logic is implemented to divide geomechanics and ppfgs in to two columns
    const charts2DArray = Object.keys(groupedGeomechanicsData).map((key) => [
      <CurveCentricCard
        key={key}
        chartData={groupedGeomechanicsData[key]}
        axisNames={axisNames}
      />,
    ]);

    Object.keys(groupedPPFGData).forEach((key, index) => {
      if (charts2DArray[index]) {
        charts2DArray[index].push(
          <CurveCentricCard
            key={key}
            chartData={groupedPPFGData[key]}
            axisNames={axisNames}
          />
        );
      } else {
        charts2DArray.push([
          <CurveCentricCard
            key={key}
            chartData={groupedPPFGData[key]}
            axisNames={axisNames}
          />,
        ]);
      }
    });

    const groupedCharts = flatten(charts2DArray);

    const fitCharts = filterByChartType(charts, [MeasurementType.fit]);
    if (fitCharts.length > 0) {
      groupedCharts.push(
        <CurveCentricCard
          key="FIT"
          chartData={fitCharts}
          axisNames={axisNames}
        />
      );
    }

    const lotCharts = filterByChartType(charts, [MeasurementType.lot]);
    if (lotCharts.length > 0) {
      groupedCharts.push(
        <CurveCentricCard
          key="LOT"
          chartData={lotCharts}
          axisNames={axisNames}
        />
      );
    }
    return groupedCharts;
  }, [charts]);

  return (
    <>
      {chartRendering && <Loading />}
      <CurveCentricViewWrapper visible={!chartRendering}>
        {wellCards}
      </CurveCentricViewWrapper>
    </>
  );
};

export default CurveCentricView;
