import React, { useEffect, useMemo, useState } from 'react';

import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';

import { WhiteLoader } from 'components/loading';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { useSecondarySelectedOrHoveredWellbores } from 'modules/wellSearch/selectors';
import { MeasurementChartData } from 'modules/wellSearch/types';

import { formatChartData } from '../utils';

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

  const selectedOrHoveredWellbores = useSecondarySelectedOrHoveredWellbores();

  const userPreferredUnit = useUserPreferencesMeasurement();

  const [charts, setCharts] = useState<MeasurementChartData[]>([]);

  const [chartRendering, setChartRendering] = useState<boolean>(false);

  const updateChartData = () => {
    if (data) {
      const wellboreChartData = selectedOrHoveredWellbores.map((wellbore) =>
        formatChartData(
          data[wellbore.id],
          geomechanicsCurves,
          ppfgCurves,
          otherTypes,
          measurementReference,
          pressureUnit.toLowerCase(),
          userPreferredUnit,
          config
        ).map((row) => ({
          ...row,
          customdata: [
            wellbore.metadata?.wellName || '',
            `${wellbore.description} ${wellbore.name}`,
          ],
        }))
      );
      setCharts(flatten(wellboreChartData));
    }
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
    selectedOrHoveredWellbores,
    pressureUnit,
    geomechanicsCurves,
    ppfgCurves,
    measurementReference,
    otherTypes,
    userPreferredUnit,
  ]);

  const wellCards = useMemo(() => {
    const groupedData = groupBy(charts, 'name');
    return Object.keys(groupedData).map((key) => (
      <CurveCentricCard
        key={key}
        chartData={groupedData[key]}
        axisNames={{
          x2: `Pressure (${pressureUnit.toLowerCase()})`,
          x: 'Angle (deg)',
          y: `${measurementReference} (${userPreferredUnit})`,
        }}
      />
    ));
  }, [charts]);

  return (
    <>
      {chartRendering && <WhiteLoader />}
      <CurveCentricViewWrapper visible={!chartRendering}>
        {wellCards}
      </CurveCentricViewWrapper>
    </>
  );
};

export default CurveCentricView;
