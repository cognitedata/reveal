import React, { useEffect, useMemo, useState } from 'react';

import { WhiteLoader } from 'components/loading';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { useSecondarySelectedOrHoveredWellbores } from 'modules/wellSearch/selectors';
import { MeasurementChartData, Wellbore } from 'modules/wellSearch/types';

import { formatChartData } from '../utils';

import { WellCentricViewWrapper } from './elements';
import WellCentricCard from './WellCentricCard';

type Props = {
  geomechanicsCurves: string[];
  ppfgCurves: string[];
  otherTypes: string[];
  pressureUnit: string;
  measurementReference: string;
};

type WellboreChartData = {
  wellbore: Wellbore;
  chartData: MeasurementChartData[];
};

export const WellCentricView: React.FC<Props> = ({
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

  const [wellboreChartData, setWellboreChartData] = useState<
    WellboreChartData[]
  >([]);

  const [chartRendering, setChartRendering] = useState<boolean>(false);

  const updateChartData = () => {
    if (data) {
      const filteredChartData = selectedOrHoveredWellbores
        .map((wellbore) => ({
          wellbore,
          chartData: formatChartData(
            data[wellbore.id],
            geomechanicsCurves,
            ppfgCurves,
            otherTypes,
            measurementReference,
            pressureUnit.toLowerCase(),
            userPreferredUnit,
            config
          ),
        }))
        .filter((row) => row.chartData.length > 0);
      setWellboreChartData(filteredChartData);
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

  const wellCards = useMemo(
    () =>
      wellboreChartData.map((row) => (
        <WellCentricCard
          wellbore={row.wellbore}
          key={row.wellbore.id}
          chartData={row.chartData}
          axisNames={{
            x2: `Pressure (${pressureUnit.toLowerCase()})`,
            x: 'Angle (deg)',
            y: `${measurementReference} (${userPreferredUnit})`,
          }}
        />
      )),
    [wellboreChartData]
  );

  return (
    <>
      {chartRendering && <WhiteLoader />}
      <WellCentricViewWrapper visible={!chartRendering}>
        {wellCards}
      </WellCentricViewWrapper>
    </>
  );
};

export default WellCentricView;
