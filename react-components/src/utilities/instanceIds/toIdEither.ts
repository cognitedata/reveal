import type { IdEither } from '@cognite/sdk';

export function toIdEither(id: string | number): IdEither {
  if (typeof id === 'number') {
    return { id };
  }

  return { externalId: id };
}
