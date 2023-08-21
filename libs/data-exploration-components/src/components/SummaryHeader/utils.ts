import { SUMMERY_CARD_DATA_ROWS } from '@data-exploration-lib/core';

export const getSummaryCardItems = <T>(items: T[]) => {
  return items.slice(0, SUMMERY_CARD_DATA_ROWS);
};
