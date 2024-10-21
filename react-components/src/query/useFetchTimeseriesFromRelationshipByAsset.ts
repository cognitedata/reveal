/*!
 * Copyright 2024 Cognite AS
 */
import { type RelationshipResourceType, type Asset, type Timeseries } from '@cognite/sdk';
import { isUndefined } from 'lodash';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { getResourceRelationship } from '../hooks/network/getResourceRelationship';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '../utilities/queryKeys';

export const useFetchTimeseriesFromRelationshipByAsset = ({
  asset,
  filter,
  resourceTypes
}: {
  asset: Asset;
  resourceTypes: RelationshipResourceType[];
  filter?: { isStep?: boolean };
}): UseQueryResult<Timeseries[]> => {
  const sdk = useSDK();

  return useQuery({
    queryKey: [
      queryKeys.timeseriesFromRelationship(),
      asset.externalId,
      filter?.isStep,
      ...resourceTypes
    ],
    queryFn: async () => {
      const relationshipsFound = await getResourceRelationship(
        sdk,
        [asset.externalId ?? ''],
        resourceTypes
      );

      if (relationshipsFound.length > 0) {
        const timeseriesFromRelationshipFound = relationshipsFound
          ?.map((rel) => {
            if (rel.targetType === 'timeSeries' && rel.target !== undefined) {
              const newTimeseries: Timeseries = rel.target;
              if ((filter?.isStep === false || filter?.isStep === undefined) && newTimeseries.isStep) return undefined;
              return newTimeseries;
            }
            if (rel.sourceType === 'timeSeries' && rel.source !== undefined) {
              const newTimeseries: Timeseries = rel.source;
              if ((filter?.isStep === false || filter?.isStep === undefined) && newTimeseries.isStep) return undefined;
              return newTimeseries;
            }
            return undefined;
          })
          .filter((ts) => !isUndefined(ts));
        return timeseriesFromRelationshipFound;
      } else {
        return [];
      }
    }
  });
};
