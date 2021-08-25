import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';

export const getWorkflowItems = (workflowId: number) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId],
    (workflow: any) => ({ workflow })
  );

export const getPnidOptions = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.workflows.items,
  (workflowId: number, items: any) => {
    const { partialMatch } = items[workflowId].options;
    return { partialMatch };
  }
);

export const getContextualizationJobs = createSelector(
  (state: RootState) => state.contextualization,
  (contextualization: any) => {
    const { parsingJobs, uploadJobs } = contextualization;
    return {
      parsingJobs,
      uploadJobs,
    };
  }
);

export const getSelectedDiagramsIds = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.contextualization.pnidParsing,
  (workflowId: number, pnidParsing: any) =>
    pnidParsing[workflowId]?.selectedDiagramIds ?? []
);
