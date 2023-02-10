import { Asset, FileInfo, IdEither } from '@cognite/sdk';
import { useSystemQuery } from '../service/hooks/query/useSystemQuery';
import { useConventionListQuery } from '../service/hooks/query/useConventionListQuery';
import { validate } from '../utils/validation';
import { isEmpty, xor } from 'lodash';
import { useSDK } from '@cognite/sdk-provider';
import { Resource } from '../types';

type Field = keyof (Asset | FileInfo);

export const useValidate = () => {
  const sdk = useSDK();

  const { data: system, isLoading: isSystemLoading } = useSystemQuery();
  const { data: conventions, isLoading: isConventionsLoading } =
    useConventionListQuery();

  return {
    isLoading: isSystemLoading || isConventionsLoading,
    run: async (resource: Resource, field: string, dataSetIds: IdEither[]) => {
      let cursor = null;
      const hits = [];
      const misses = [];

      while (cursor !== undefined) {
        //@ts-ignore
        const { nextCursor, items } = await sdk[resource].list({
          cursor: cursor || undefined,
          filter: isEmpty(dataSetIds) ? undefined : { dataSetIds },
          limit: 1000,
        });

        //@ts-ignore
        const tags = (items || []).reduce((acc: string[], item) => {
          const value = item[field as Field];

          if (value) {
            return [...acc, value as string];
          }

          return acc;
        }, [] as string[]);

        const localHits = validate(system!, conventions!, tags);
        const localMisses = xor(tags, localHits);

        hits.push(...localHits);
        misses.push(...localMisses);

        cursor = nextCursor;
      }

      return {
        hits,
        misses,
      };
    },
  };
};
