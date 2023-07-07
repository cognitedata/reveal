import { IdEither } from '@cognite/sdk';

type IdEitherData =
  | { property: 'externalId'; value: string }
  | { property: 'id'; value: number };

export const extractIdEitherData = (idEither: IdEither): IdEitherData => {
  if ('externalId' in idEither) {
    return {
      property: 'externalId',
      value: idEither.externalId,
    };
  }

  return {
    property: 'id',
    value: idEither.id,
  };
};
