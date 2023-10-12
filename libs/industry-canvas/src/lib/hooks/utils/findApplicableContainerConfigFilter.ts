import isEqual from 'lodash/isEqual';

import { ContainerType } from '@cognite/unified-file-viewer';

import { Filter, IndustryCanvasContainerConfig } from '../../types';

export const findApplicableContainerConfigFilter = (
  containerConfig: IndustryCanvasContainerConfig,
  filters: Filter[]
): Filter | undefined => {
  const conditionals = [
    {
      valueAtPath: 'metadata.type',
      isEqualTo: containerConfig.metadata.eventType,
    },
    {
      valueAtPath: 'metadata.subtype',
      isEqualTo: containerConfig.metadata.eventSubType,
    },
  ];

  return filters.findLast((filter) => {
    const isSingleContainerFilter = filter.containerId === containerConfig.id;
    if (isSingleContainerFilter) {
      return true;
    }

    const isGenericAssetFilter =
      filter.containerId === undefined &&
      containerConfig.type === ContainerType.ASSET &&
      filter.appliesToContainerType === ContainerType.ASSET;

    if (isGenericAssetFilter) {
      return true;
    }

    const areConditionalsOrderIndependentlyEqual =
      conditionals.length === filter.appliesWhen?.length &&
      conditionals.every((conditional) =>
        filter.appliesWhen?.some((filterConditional) =>
          isEqual(conditional, filterConditional)
        )
      );

    const isGenericTypeSubTypeEventFilter =
      filter.containerId === undefined &&
      containerConfig.type === ContainerType.EVENT &&
      filter.appliesToContainerType === ContainerType.EVENT &&
      areConditionalsOrderIndependentlyEqual;

    if (isGenericTypeSubTypeEventFilter) {
      return true;
    }

    return false;
  });
};

export default findApplicableContainerConfigFilter;
