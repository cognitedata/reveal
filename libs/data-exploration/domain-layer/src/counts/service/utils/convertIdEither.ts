import { IdEither } from '@cognite/sdk';

import { extractIdEitherData } from './extractIdEitherData';

type FilterKey = 'equals' | 'inAssetSubtree';

export const convertIdEither = (key: FilterKey, idEither: IdEither) => {
  const { property, value } = extractIdEitherData(idEither);

  switch (key) {
    case 'equals':
      return {
        equals: {
          property: [property],
          value,
        },
      };

    case 'inAssetSubtree':
      return {
        inAssetSubtree: {
          property: [
            property === 'externalId' ? 'assetExternalIds' : 'assetIds',
          ],
          values: [value],
        },
      };
  }
};
