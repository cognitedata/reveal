import { pipe } from 'lodash/fp';
import isEqual from 'lodash/isEqual';

import { ContainerType } from '@cognite/unified-file-viewer';

import { Filter, IndustryCanvasContainerConfig } from '../../types';

const applyEventFilterByTypeAndSubType =
  (
    containerConfig: IndustryCanvasContainerConfig,
    propertyPaths: string[],
    shouldApplyToAll: boolean
  ) =>
  (filters: Filter[]): Filter[] => {
    if (containerConfig.type !== ContainerType.EVENT) {
      return filters;
    }

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

    if (shouldApplyToAll) {
      return [
        ...filters.filter(
          (filter) =>
            !(
              filter.appliesToContainerType === ContainerType.EVENT &&
              isEqual(filter.appliesWhen, conditionals)
            )
        ),
        {
          appliesToContainerType: ContainerType.EVENT,
          appliesWhen: conditionals,
          properties: propertyPaths,
        },
      ];
    }

    return [
      ...filters.filter(
        (filter) =>
          !(
            filter.appliesToContainerType === ContainerType.EVENT &&
            filter.containerId === containerConfig.id
          )
      ),
      {
        appliesToContainerType: ContainerType.EVENT,
        containerId: containerConfig.id,
        appliesWhen: conditionals,
        properties: propertyPaths,
      },
    ];
  };

const applyEventFilters =
  (
    containerConfigs: IndustryCanvasContainerConfig[],
    propertyPaths: string[],
    shouldApplyToAll: boolean
  ) =>
  (filters: Filter[]): Filter[] => {
    if (
      !containerConfigs.some(
        (containerConfig) => containerConfig.type === ContainerType.EVENT
      )
    ) {
      return filters;
    }

    return pipe(
      ...containerConfigs.map((containerConfig) =>
        applyEventFilterByTypeAndSubType(
          containerConfig,
          propertyPaths,
          shouldApplyToAll
        )
      )
    )(filters);
  };

export default applyEventFilters;
