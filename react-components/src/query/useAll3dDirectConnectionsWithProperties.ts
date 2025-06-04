import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { type FdmConnectionWithNode } from '../components/CacheProvider/types';
import { type InstanceType } from '@cognite/sdk';
import { chunk, uniqBy } from 'lodash';
import {
  type FdmInstanceNodeWithConnectionAndProperties,
  type FdmInstanceWithPropertiesAndTyping
} from '../components/RuleBasedOutputs/types';
import { useMemo } from 'react';
import { createFdmKey } from '../components/CacheProvider/idAndKeyTranslation';
import { executeParallel } from '../utilities/executeParallel';
import { isDefined } from '../utilities/isDefined';

const MAX_PARALLEL_QUERIES = 4;

export function useAll3dDirectConnectionsWithProperties(
  connectionWithNodeAndView: FdmConnectionWithNode[]
): UseQueryResult<FdmInstanceNodeWithConnectionAndProperties[]> {
  const fdmSdk = useFdmSdk();

  const connectionKeys = useMemo(() => {
    return connectionWithNodeAndView.map((item) => {
      const fdmKey = createFdmKey(item.connection.instance);
      return fdmKey;
    });
  }, [connectionWithNodeAndView]);

  const connectionWithNodeAndViewMap = useMemo(() => {
    return new Map(
      connectionWithNodeAndView.map((item) => {
        const fdmKey = createFdmKey(item.connection.instance);
        return [fdmKey, item];
      })
    );
  }, [connectionWithNodeAndView]);

  return useQuery({
    queryKey: [
      'reveal-react-components',
      'get-all-3d-related-direct-connections',
      ...connectionKeys.sort()
    ],
    queryFn: async () => {
      const instanceType: InstanceType = 'node';
      const instancesData = connectionWithNodeAndView.map((item) => {
        return {
          externalId: item.connection.instance.externalId,
          space: item.connection.instance.space,
          instanceType
        };
      });

      const instancesViews = connectionWithNodeAndView.flatMap((item) => {
        return item.views;
      });

      const uniqueViews = uniqBy(instancesViews, (item) => {
        if (item === undefined) {
          return '';
        }
        const fdmKey = createFdmKey(item);
        return fdmKey;
      });

      const instancesDataChunks = chunk(instancesData, 1000);

      const instancesContentFlat = instancesDataChunks
        .flatMap((chunk) => {
          return uniqueViews.map((view) => {
            return { chunk, view };
          });
        })
        .flat()
        .filter(isDefined);

      const instancesContent = await executeParallel(
        instancesContentFlat.map((content) => async () => {
          const data = await fdmSdk.getByExternalIds(
            content.chunk,
            content.view !== undefined ? [content.view] : undefined
          );

          return {
            items: data.items,
            typing: data.typing
          };
        }),
        MAX_PARALLEL_QUERIES
      );

      const cleanInstancesContent = instancesContent.filter(isDefined).flat();

      if (instancesContent === undefined) {
        return [];
      }

      const flatInstancesContent = cleanInstancesContent.flatMap((instanceContent) => {
        return instanceContent.items.map((item) => {
          return {
            item,
            typing: instanceContent.typing
          };
        });
      });

      const instancesContentChunks = chunk(flatInstancesContent, 1000);

      const relatedObjectInspectionsResult = await executeParallel(
        instancesContentChunks.flatMap((instances) => {
          return async () => {
            return await fdmSdk.inspectInstances({
              inspectionOperations: { involvedViews: {} },
              items: instances.map((data) => {
                return {
                  instanceType: data.item.instanceType,
                  externalId: data.item.externalId,
                  space: data.item.space
                };
              })
            });
          };
        }),
        MAX_PARALLEL_QUERIES
      );

      const cleanRelatedObjectInspectionsResult = relatedObjectInspectionsResult.filter(isDefined);

      const instanceItemsAndTyping: FdmInstanceWithPropertiesAndTyping[] =
        cleanRelatedObjectInspectionsResult
          .flatMap((inspectionResult) =>
            inspectionResult.items.flatMap((inspectionResultItem) =>
              cleanInstancesContent.flatMap((instanceContent) => {
                const node: FdmInstanceWithPropertiesAndTyping = {
                  items: instanceContent.items.filter(
                    (item) =>
                      item.space === inspectionResultItem.space &&
                      item.externalId === inspectionResultItem.externalId
                  ),
                  typing: instanceContent.typing ?? {}
                };
                return node;
              })
            )
          )
          .filter((item) => item.items.length > 0);

      const instanceWithData =
        instanceItemsAndTyping?.flatMap((itemsData) => {
          let connectionFound: FdmConnectionWithNode | undefined;

          itemsData.items.every((itemData) => {
            const fdmKey = createFdmKey(itemData);
            if (connectionWithNodeAndViewMap.has(fdmKey)) {
              connectionFound = connectionWithNodeAndViewMap.get(fdmKey);
              return false;
            }
            return true;
          });

          return {
            ...connectionFound,
            ...itemsData
          };
        }) ?? [];

      return instanceWithData;
    },
    enabled: connectionWithNodeAndView.length > 0
  });
}
