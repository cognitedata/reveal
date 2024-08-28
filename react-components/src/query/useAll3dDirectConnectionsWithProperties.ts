/*!
 * Copyright 2023 Cognite AS
 */

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

export function useAll3dDirectConnectionsWithProperties(
  connectionWithNodeAndView: FdmConnectionWithNode[]
): UseQueryResult<FdmInstanceNodeWithConnectionAndProperties[]> {
  const fdmSdk = useFdmSdk();

  const connectionKeys = useMemo(() => {
    return connectionWithNodeAndView.map((item) => {
      return item.connection.instance.externalId + '/' + item.connection.instance.space;
    });
  }, [connectionWithNodeAndView]);

  const connectionWithNodeAndViewMap = useMemo(() => {
    return new Map(
      connectionWithNodeAndView.map((item) => {
        return [`${item?.connection.instance.space}/${item?.connection.instance.externalId}`, item];
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

      const instancesViews = connectionWithNodeAndView.map((item) => {
        return item.view;
      });

      const uniqueViews = uniqBy(instancesViews, (item) => {
        return `${item?.space}/${item?.externalId}`;
      });

      const instancesDataChunks = chunk(instancesData, 1000);

      const instancesContent = await Promise.all(
        instancesDataChunks.flatMap((chunk) => {
          return uniqueViews.map(async (view) => {
            return await fdmSdk.getByExternalIds(chunk, view);
          });
        })
      );

      if (instancesContent === undefined) {
        return [];
      }

      const instancesContentChunks = chunk(instancesContent, 1000);

      const relatedObjectInspectionsResult = await Promise.all(
        instancesContentChunks.flatMap((instances) =>
          instances.flatMap(async (item) => {
            const items = item.items.map((fdmId) => ({
              space: fdmId.space,
              externalId: fdmId.externalId,
              instanceType
            }));
            return await fdmSdk.inspectInstances({
              inspectionOperations: { involvedViews: {} },
              items
            });
          })
        )
      );

      const instanceItemsAndTyping: FdmInstanceWithPropertiesAndTyping[] =
        relatedObjectInspectionsResult
          .flatMap((inspectionResult) =>
            inspectionResult.items.flatMap((inspectionResultItem) =>
              instancesContent.flatMap((instanceContent) => {
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
            const key = `${itemData.space}/${itemData.externalId}`;
            if (connectionWithNodeAndViewMap.has(key)) {
              connectionFound = connectionWithNodeAndViewMap.get(key);
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
