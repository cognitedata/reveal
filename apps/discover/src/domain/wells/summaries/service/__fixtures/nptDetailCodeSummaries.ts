import { SummaryCount } from '@cognite/sdk-wells';

export const getNptDetailCodeSummaries = (): SummaryCount[] => {
  return [
    {
      property: 'ABC',
      count: 1,
    },
    {
      property: 'XYZ',
      count: 10,
    },
  ];
};
