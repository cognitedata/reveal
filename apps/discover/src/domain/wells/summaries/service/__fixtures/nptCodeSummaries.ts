import { SummaryCount } from '@cognite/sdk-wells';

export const getNptCodeSummaries = (): SummaryCount[] => {
  return [
    {
      property: 'TEST',
      count: 1,
    },
    {
      property: 'TEST2',
      count: 10,
    },
  ];
};
