import { useCallback, useState } from 'react';

import { ContainerType } from '@cognite/unified-file-viewer';

type SupportedContainerType = ContainerType.TIMESERIES;

export type TooltipsOptions = {
  [ContainerType.TIMESERIES]: {
    shouldApplyToAll: boolean;
    startDate?: string;
    endDate?: string;
  };
};

export type OnUpdateTooltipsOptions = (
  containerType: SupportedContainerType,
  options: Partial<TooltipsOptions[SupportedContainerType]>
) => void;

export type UseTooltipsOptionsReturnType = {
  tooltipsOptions: TooltipsOptions;
  onUpdateTooltipsOptions: OnUpdateTooltipsOptions;
};

export const useTooltipsOptions = (): UseTooltipsOptionsReturnType => {
  const [tooltipsOptions, setTooltipsOptions] = useState<TooltipsOptions>({
    [ContainerType.TIMESERIES]: {
      shouldApplyToAll: false,
    },
  });

  const onUpdateTooltipsOptions = useCallback<OnUpdateTooltipsOptions>(
    (containerType, options) => {
      setTooltipsOptions((prev) => ({
        ...prev,
        [containerType]: {
          ...prev[containerType],
          ...options,
        },
      }));
    },
    []
  );

  return {
    tooltipsOptions,
    onUpdateTooltipsOptions,
  };
};
