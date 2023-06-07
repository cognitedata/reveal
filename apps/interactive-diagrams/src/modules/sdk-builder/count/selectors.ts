import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { ApiCountResult, CountState } from 'modules/types';
import { defaultCount } from '.';

export function createCountSelector(
  countSelector: (_: RootState) => CountState
): (_: RootState) => (query: any) => ApiCountResult {
  return createSelector(countSelector, (counts) => (query: any) => {
    const key = JSON.stringify(query);
    return (counts[key] || defaultCount) as ApiCountResult;
  });
}
