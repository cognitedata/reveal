import { ContainerType } from '@cognite/unified-file-viewer';

import { TooltipsOptions } from '../hooks/useTooltipsOptions';
import { ContainerReference, ContainerReferenceType } from '../types';

const enforceTimeseriesApplyToAllIfEnabled = (
  tooltipsOptions: TooltipsOptions,
  containerReferences: ContainerReference[]
): ContainerReference[] => {
  if (!tooltipsOptions[ContainerType.TIMESERIES].shouldApplyToAll) {
    return containerReferences;
  }

  const { startDate, endDate } = tooltipsOptions[ContainerType.TIMESERIES];

  if (startDate === undefined || endDate === undefined) {
    return containerReferences;
  }

  return containerReferences.map((containerReference) =>
    containerReference.type === ContainerReferenceType.TIMESERIES
      ? {
          ...containerReference,
          startDate: startDate.toString(),
          endDate: endDate.toString(),
        }
      : containerReference
  );
};

export default enforceTimeseriesApplyToAllIfEnabled;
