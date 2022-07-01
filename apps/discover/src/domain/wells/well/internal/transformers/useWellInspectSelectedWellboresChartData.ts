import { useMeasurementsQuery } from 'domain/wells/measurements0/internal/queries/useMeasurementsQuery';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { PressureUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { formatChartData } from 'pages/authorized/search/well/inspect/modules/measurements/utils';

import { useWellInspectSelectedWellbores } from './useWellInspectSelectedWellbores';

export type Props = {
  geomechanicsCurves: DepthMeasurementColumn[];
  ppfgCurves: DepthMeasurementColumn[];
  otherTypes: DepthMeasurementColumn[];
  pressureUnit: PressureUnit;
};

export const useWellInspectSelectedWellboresChartData = ({
  geomechanicsCurves,
  ppfgCurves,
  otherTypes,
  pressureUnit,
}: Props) => {
  const wellbores = useWellInspectSelectedWellbores();
  const { data: measurementData, isLoading } = useMeasurementsQuery();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    if (isLoading || measurementData === undefined || !userPreferredUnit) {
      return { data: [], isLoading };
    }

    const data = wellbores.map((wellbore) => ({
      wellbore,
      proccessedData: formatChartData(
        measurementData[wellbore.matchingId || ''], // Matching id is not optional in sdkv3. this is due to handling two sdk's
        geomechanicsCurves,
        ppfgCurves,
        otherTypes,
        pressureUnit,
        userPreferredUnit
      ),
    }));

    return { data, isLoading };
  }, [
    wellbores,
    measurementData,
    isLoading,
    geomechanicsCurves,
    ppfgCurves,
    otherTypes,
    pressureUnit,
    pressureUnit,
  ]);
};
