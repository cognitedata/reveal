import { useQuery } from '@tanstack/react-query';
import { keyBy, mapValues } from 'lodash';

import { CogniteClient } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';
import { ContainerType } from '@cognite/unified-file-viewer';

import { IndustryCanvasContainerConfig } from '../../../types';
import getPromiseAllValues from '../../../utils/const';
import { Properties } from '../types';

const resolveContainerConfigResource = async (
  sdk: CogniteClient,
  containerConfig: IndustryCanvasContainerConfig
) => {
  const resourceId = containerConfig.metadata.resourceId;
  if (resourceId === undefined) {
    throw new Error(
      'Invalid containerConfig - resourceId should never be undefined'
    );
  }

  if (containerConfig.type === ContainerType.ASSET) {
    const assets = await sdk.assets.retrieve([{ id: resourceId }]);
    if (assets.length !== 1) {
      throw Error('There must be exactly one unique asset for an asset id');
    }
    return assets[0];
  }

  if (containerConfig.type === ContainerType.EVENT) {
    const events = await sdk.events.retrieve([{ id: resourceId }]);
    if (events.length !== 1) {
      throw Error('There must be exactly one unique event for an event id');
    }
    return events[0];
  }

  throw new Error('Invalid container type');
};

const useResolveContainerConfigsPropertiesById = (
  containerConfigs: IndustryCanvasContainerConfig[]
) => {
  const sdk = useSDK();
  return useQuery<Record<string, Properties>>(
    [
      'containerConfigsPropertiesById',
      containerConfigs.map((containerConfig) => containerConfig.id),
    ],

    async (): Promise<Record<string, Properties>> =>
      getPromiseAllValues<Properties>(
        mapValues(
          keyBy(containerConfigs, (containerConfig) => containerConfig.id),
          async (containerConfig) => {
            const resource = await resolveContainerConfigResource(
              sdk,
              containerConfig
            );

            const { metadata = {}, ...baseProps } = resource;

            const properties: Properties = [
              ...Object.entries(baseProps).map(([key, value]) => ({
                path: key,
                value,
                isSelected: false,
              })),
              ...Object.entries(metadata).map(([key, value]) => ({
                path: `metadata.${key}`,
                value,
                isSelected: false,
              })),
            ];
            return properties;
          }
        )
      ),
    {
      enabled: containerConfigs.every(
        (containerConfig) =>
          containerConfig.metadata.resourceId !== undefined &&
          (containerConfig.type === ContainerType.ASSET ||
            containerConfig.type === ContainerType.EVENT) &&
          containerConfigs.length > 0
      ),
    }
  );
};

export default useResolveContainerConfigsPropertiesById;
