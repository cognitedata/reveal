import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import isEmpty from 'lodash/isEmpty';

import { PressureUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { formatChartData } from 'pages/authorized/search/well/inspect/modules/measurements/utils';

import { useMeasurementsData } from './useMeasurementsData';

export type Props = {
  geomechanicsCurves: DepthMeasurementDataColumnInternal[];
  ppfgCurves: DepthMeasurementDataColumnInternal[];
  otherTypes: DepthMeasurementDataColumnInternal[];
  pressureUnit: PressureUnit;
};

export const useWellInspectSelectedWellboresChartData = ({
  geomechanicsCurves,
  ppfgCurves,
  otherTypes,
  pressureUnit,
}: Props) => {
  const wellbores = useWellInspectSelectedWellbores();
  const { groupedData, isLoading } = useMeasurementsData();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    if (isLoading || isEmpty(groupedData) || !userPreferredUnit) {
      return { data: [], isLoading };
    }

    const data = wellbores.map((wellbore) => ({
      wellbore,
      proccessedData: formatChartData(
        groupedData[wellbore.matchingId || ''], // Matching id is not optional in sdkv3. this is due to handling two sdk's
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
    groupedData,
    isLoading,
    geomechanicsCurves,
    ppfgCurves,
    otherTypes,
    pressureUnit,
    pressureUnit,
  ]);
};
