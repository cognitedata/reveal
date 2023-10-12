import { ContainerType } from '@cognite/unified-file-viewer';

import { Filter, IndustryCanvasContainerConfig } from '../../types';

const applyAssetFilters =
  (
    containerConfigs: IndustryCanvasContainerConfig[],
    propertyPaths: string[],
    shouldApplyToAll: boolean
  ) =>
  (filters: Filter[]): Filter[] => {
    if (
      !containerConfigs.some(
        (containerConfig) => containerConfig.type === ContainerType.ASSET
      )
    ) {
      return filters;
    }

    if (shouldApplyToAll) {
      return [
        ...filters.filter(
          (filter) => filter.appliesToContainerType !== ContainerType.ASSET
        ),
        {
          appliesToContainerType: ContainerType.ASSET,
          properties: propertyPaths,
        },
      ];
    }

    const containerConfigIds = containerConfigs.map(
      (containerConfig) => containerConfig.id
    );
    return [
      ...filters.filter((filter) => {
        const isNotAnAssetFilter =
          filter.appliesToContainerType !== ContainerType.ASSET;

        const isGenericAssetFilter =
          filter.appliesToContainerType === ContainerType.ASSET &&
          filter.containerId === undefined;

        const isSpecificAssetFilterForIncludedContainerConfigs =
          filter.appliesToContainerType === ContainerType.ASSET &&
          filter.containerId !== undefined &&
          !containerConfigIds.includes(filter.containerId);

        return (
          isNotAnAssetFilter ||
          isGenericAssetFilter ||
          isSpecificAssetFilterForIncludedContainerConfigs
        );
      }),
      ...containerConfigs.map((containerConfig) => ({
        appliesToContainerType: ContainerType.ASSET,
        containerId: containerConfig.id,
        properties: propertyPaths,
      })),
    ];
  };

export default applyAssetFilters;
