/*!
 * Copyright 2024 Cognite AS
 */

export const buildFilter = (query: string): any => {
  if (query === '') {
    return undefined;
  }

  const searchConditions = [
    { search: { property: ['name'], value: query } },
    { search: { property: ['description'], value: query } }
  ];

  return {
    and: [
      {
        or: searchConditions
      }
    ]
  };
};
