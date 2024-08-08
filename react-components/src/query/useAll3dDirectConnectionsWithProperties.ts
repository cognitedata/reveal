/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import {
  type FdmInstanceNodeWithConnectionAndProperties,
  type FdmInstanceWithPropertiesAndTyping
} from '../data-providers/types';
import { type FdmConnectionWithNode } from '../components/CacheProvider/types';
import { type InstanceType } from '@cognite/sdk';
import { chunk, pick, uniqBy } from 'lodash';

export function useAll3dDirectConnectionsWithProperties(
  connectionWithNodeAndView: FdmConnectionWithNode[]
): UseQueryResult<FdmInstanceNodeWithConnectionAndProperties[]> {
  const fdmSdk = useFdmSdk();

  return useQuery({
    queryKey: ['reveal-react-components', 'get-all-3d-related-direct-connections'],
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

      const uniqueViews = uniqBy(instancesViews, (item) =>
        JSON.stringify(pick(item, ['externalId', 'space']))
      );

      console.log('TEST instancesViews', instancesViews);
      console.log('TEST uniqueViews', uniqueViews);
      console.log('TEST instancesData', instancesData);

      const instancesDataChunks = chunk(instancesData, 1000);
      const instancesContent = await Promise.all(
        instancesDataChunks.flatMap((chunk) => {
          return uniqueViews.map(async (view) => {
            return await fdmSdk.getByExternalIds(chunk, view);
          });
        })
      );

      console.log('TEST instancesContent', instancesContent);

      if (instancesContent === undefined) {
        return [];
      }

      const instancesContentChunks = chunk(instancesContent, 1000);

      const relatedObjectInspectionsResult = await Promise.all(
        instancesContentChunks.flatMap((instances) =>
          instances.flatMap(
            async (item) =>
              await fdmSdk.inspectInstances({
                inspectionOperations: { involvedViews: {} },
                items: item.items.map((fdmId) => ({
                  space: fdmId.space,
                  externalId: fdmId.externalId,
                  instanceType
                }))
              })
          )
        )
      );

      const data: FdmInstanceWithPropertiesAndTyping[] = relatedObjectInspectionsResult.flatMap(
        (inspectionResult) =>
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
      );
      const instanceWithData =
        data?.flatMap((itemsData) => {
          const connectionFound = connectionWithNodeAndView.find((item) =>
            itemsData.items.find(
              (itemData) =>
                itemData.externalId === item.connection.instance.externalId &&
                itemData.space === item.connection.instance.space
            )
          );
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
