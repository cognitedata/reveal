import { WellEventLegend } from '@cognite/discover-api-types/types/model/wellEventLegend';

export const nptCodeLegend = (extras: WellEventLegend[] = []) => [
  {
    id: 'npt_test_id_1',
    legend: 'npt test legend 1',
    type: 'code',
    event: '',
  },
  {
    id: 'npt_test_id_2',
    legend: 'npt test legend 2',
    type: 'code',
    event: '',
  },
  ...extras,
];
