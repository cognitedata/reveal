import { formatDate } from 'utils/utils';

export const mockDayAheadMarketHeaderData = {
  priceAreaName: 'NO1',
  startDate: formatDate(new Date('2022-11-16T13:23:54.611Z')),
};

export const mockProcessConfigurations = [
  {
    bidProcessEventExternalId:
      'POWEROPS_DAY_AHEAD_BID_MATRIX_CALCULATION_bb9fc5c7-3113-4547-b650-8c919fddf0f7',
    bidProcessConfiguration: 'multi_scenario',
    bidProcessStartedDate: formatDate(new Date('2022-11-16T12:23:54.611Z')),
    bidProcessFinishedDate: formatDate(new Date('2022-11-16T13:23:54.611Z')),
  },
  {
    bidProcessEventExternalId:
      'POWEROPS_DAY_AHEAD_BID_MATRIX_CALCULATION_d262bcf1-11f6-40d7-9aba-2c23e6677139',
    bidProcessConfiguration: 'price_independent',
    bidProcessStartedDate: formatDate(new Date('2022-11-16T11:23:54.611Z')),
    bidProcessFinishedDate: formatDate(new Date('2022-11-16T13:23:54.611Z')),
  },
];
