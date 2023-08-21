import { SUMMERY_CARD_DATA_ROWS } from '../constants';

export const isSummaryCardDataCountExceed = (count: number) => {
  return count >= SUMMERY_CARD_DATA_ROWS;
};
