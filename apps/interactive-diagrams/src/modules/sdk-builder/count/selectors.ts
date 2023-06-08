import {
  ApiCountResult,
  CountState,
} from '@interactive-diagrams-app/modules/types';
import { RootState } from '@interactive-diagrams-app/store';
import { createSelector } from '@reduxjs/toolkit';

import { defaultCount } from '.';

export function createCountSelector(
  countSelector: (_: RootState) => CountState
): (_: RootState) => (query: any) => ApiCountResult {
  return createSelector(countSelector, (counts) => (query: any) => {
    const key = JSON.stringify(query);
    return (counts[key] || defaultCount) as ApiCountResult;
  });
}
