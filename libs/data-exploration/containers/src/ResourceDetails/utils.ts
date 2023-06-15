import { ResourceType, ViewType } from '@data-exploration-lib/core';

export const getResourcesVisibility = (visibleResources: ResourceType[]) => {
  return {
    isAssetVisible: visibleResources.includes(ViewType.Asset),
    isFileVisible: visibleResources.includes(ViewType.File),
    isTimeseriesVisible: visibleResources.includes(ViewType.TimeSeries),
    isSequenceVisible: visibleResources.includes(ViewType.Sequence),
    isEventVisible: visibleResources.includes(ViewType.Event),
  };
};
