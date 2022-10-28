import { useDepthMeasurementsForMeasurementTypes } from 'domain/wells/measurements/internal/hooks/useDepthMeasurementsForMeasurementTypes';
import { useDepthMeasurementsTVD } from 'domain/wells/measurements/internal/hooks/useDepthMeasurementsTVD';
import { getErrors } from 'domain/wells/measurements/internal/utils/getErrors';
import { useNdsEventsQuery } from 'domain/wells/nds/internal/queries/useNdsEventsQuery';
import { adaptNdsEventsToMultiSelect } from 'domain/wells/nds/internal/transformers/adaptNdsEventsToMultiSelect';
import { useNptEventsQuery } from 'domain/wells/npt/internal/queries/useNptEventsQuery';
import { adaptNptEventsToMultiSelect } from 'domain/wells/npt/internal/transformers/adaptNptEventsToMultiSelect';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

import { adaptMeasurementDataToView } from '../utils/adaptMeasurementDataToView';
import { getCurveFilterOptions } from '../utils/getCurveFilterOptions';

export const useMeasurementsData = () => {
  const wellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data, isLoading: isDepthMeasurementsLoading } =
    useDepthMeasurementsForMeasurementTypes({
      wellboreIds,
    });

  const { data: tvdData, isLoading: isTvdDataLoading } =
    useDepthMeasurementsTVD(data);

  const { data: nptEvents = [], isLoading: isNptEventsLoading } =
    useNptEventsQuery({
      wellboreIds,
    });

  const { data: ndsEvents = [], isLoading: isNdsEventsLoading } =
    useNdsEventsQuery({
      wellboreIds,
    });

  const isLoading =
    isDepthMeasurementsLoading ||
    isTvdDataLoading ||
    isNptEventsLoading ||
    isNdsEventsLoading;

  const adaptedMeasurementsData = useDeepMemo(() => {
    return adaptMeasurementDataToView(wellbores, tvdData);
  }, [wellbores, tvdData]);

  const curveFilterOptions = useDeepMemo(
    () => getCurveFilterOptions(adaptedMeasurementsData),
    [adaptedMeasurementsData]
  );

  const nptEventsFilterOptions = useDeepMemo(
    () => adaptNptEventsToMultiSelect(nptEvents),
    [nptEvents]
  );

  const ndsEventsFilterOptions = useDeepMemo(
    () => adaptNdsEventsToMultiSelect(ndsEvents),
    [ndsEvents]
  );

  const errors = useDeepMemo(
    () => getErrors(adaptedMeasurementsData),
    [adaptedMeasurementsData]
  );

  return {
    isLoading,
    data: adaptedMeasurementsData,
    nptEvents,
    ndsEvents,
    curveFilterOptions,
    nptEventsFilterOptions,
    ndsEventsFilterOptions,
    errors,
  };
};
