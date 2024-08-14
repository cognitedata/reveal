/*!
 * Copyright 2024 Cognite AS
 */

export const buildFilter = (query: string): any => {
  if (query === '') {
    return undefined;
  }
  const conditions = ['search']
    .map((condition) => [
      {
        [condition]: {
          property: ['name'],
          value: query
        }
      },
      {
        [condition]: {
          property: ['description'],
          value: query
        }
      }
    ])
    .flat();

  return {
    and: [
      {
        or: conditions
      }
    ]
  };
};
