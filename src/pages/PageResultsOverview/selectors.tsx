import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { Workflow } from 'modules/types';

export const getWorkflowItems = (workflowId: number) =>
  createSelector(
    (state: RootState) => state.workflows.items[workflowId],
    (workflow: any) => ({ workflow })
  );

export const getSvgConvertJobs = createSelector(
  (state: RootState) => state.svgConvert,
  (svgConvert: any) => {
    return svgConvert;
  }
);

export const getSelectedDiagramsIds = createSelector(
  (state: RootState) => state.workflows.active,
  (state: RootState) => state.workflows.items,
  (workflowId: number, items: { [id: number]: Workflow }) => {
    const activeWorkflow = items[workflowId];
    return activeWorkflow?.jobs.selectedDiagramIds;
  }
);
