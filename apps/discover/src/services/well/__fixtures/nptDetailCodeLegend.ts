import { WellEventLegend } from '@cognite/discover-api-types/types/model/wellEventLegend';

export const nptDetailCodeLegend = (extras: WellEventLegend[] = []) => [
  {
    id: 'npt_details_code_id_1',
    legend: 'npt detail code legend',
    type: 'detailCode',
    event: '',
  },
  ...extras,
];
