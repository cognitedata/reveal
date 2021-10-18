import React, { useMemo } from 'react';

import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { useSecondarySelectedOrHoveredWellbores } from 'modules/wellSearch/selectors';

import { WellCentricViewWrapper } from './elements';
import { formatChartData } from './utils';
import WellCentricCard from './WellCentricCard';

type Props = {
  geomechanicsCurves: string[];
  ppfgCurves: string[];
  otherTypes: string[];
  pressureUnit: string;
  measurementReference: string;
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

  const filteredWellboresData = useMemo(() => {
    if (!data) {
      return [];
    }
    return selectedOrHoveredWellbores
      .map((wellbore) => {
        const chartData = formatChartData(
          data[wellbore.id],
          geomechanicsCurves,
          ppfgCurves,
          otherTypes,
          measurementReference,
          pressureUnit.toLowerCase(),
          config
        );
        return {
          wellbore,
          chartData,
        };
      })
      .filter((row) => row.chartData.length > 0);
  }, [
    data,
    isLoading,
    selectedOrHoveredWellbores,
    pressureUnit,
    geomechanicsCurves,
    ppfgCurves,
    measurementReference,
    otherTypes,
  ]);

  return (
    <WellCentricViewWrapper>
      {filteredWellboresData.map((row) => (
        <WellCentricCard
          wellbore={row.wellbore}
          key={row.wellbore.id}
          chartData={row.chartData}
          axisNames={{
            x2: `Pressure (${pressureUnit.toLowerCase()})`,
            x: 'Angle (deg)',
            y: `${measurementReference} (ft)`,
          }}
        />
      ))}
    </WellCentricViewWrapper>
  );
};

export default WellCentricView;
