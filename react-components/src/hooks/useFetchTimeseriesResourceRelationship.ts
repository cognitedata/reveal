/*!
 * Copyright 2024 Cognite AS
 */
import { type Asset, type Timeseries } from '@cognite/sdk';
import { isUndefined } from 'lodash';
import { useEffect } from 'react';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { getResourceRelationship } from './network/getResourceRelationship';

export const useFetchTimeseriesResourceRelationship = ({
  asset,
  filter,
  callback
}: {
  asset: Asset;
  callback: (data: Timeseries[]) => void;
  filter?: { isStep?: boolean; isString?: boolean };
}): void => {
  const sdk = useSDK();

  useEffect(() => {
    const getRelationship = async (): Promise<void> => {
      const relationshipsFound = await getResourceRelationship(
        sdk,
        [asset.externalId ?? ''],
        ['timeSeries']
      );

      if (relationshipsFound.length > 0) {
        const timeseriesFromRelationshipFound = relationshipsFound
          ?.map((rel) => {
            if (rel.targetType === 'timeSeries' && rel.target !== undefined) {
              const newTimeseries: Timeseries = rel.target;
              if (filter?.isStep === false && newTimeseries.isStep) return undefined;
              return newTimeseries;
            }
            if (rel.sourceType === 'timeSeries' && rel.source !== undefined) {
              const newTimeseries: Timeseries = rel.source;
              if (filter?.isStep === false && newTimeseries.isStep) return undefined;
              return newTimeseries;
            }
            return undefined;
          })
          .filter((ts) => !isUndefined(ts));
        callback(timeseriesFromRelationshipFound);
      }
    };
    void getRelationship();
  }, [asset.externalId, filter, filter?.isStep, filter?.isString, sdk]);
};
