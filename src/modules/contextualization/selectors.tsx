import { RootState } from 'store';
import { createSelector } from 'reselect';

export const selectParsingJobForFileId = createSelector(
  (state: RootState) => state.contextualization.pnidParsing,
  (jobMap) => (fileId: number) => {
    return jobMap[fileId];
  }
);
