import { toast } from '@cognite/cogs.js';
import { nanoid } from '@reduxjs/toolkit';
import chartSlice, { Chart, ChartWorkflow } from 'reducers/charts';
import { selectTenant, selectUser } from 'reducers/environment';
import ChartService from 'services/ChartService';
import WorkflowService from 'services/WorkflowService';
import { AppThunk } from 'store';
import { getEntryColor } from 'utils/colors';
import workflowSlice from './slice';
import { Workflow } from './types';

import { node as TimeSeriesReferenceNode } from './Nodes/TimeSeriesReference';
import { node as OutputSeriesNode } from './Nodes/OutputSeries';

export const fetchWorkflowsForChart = (
  workflowIds: string[]
): AppThunk => async (dispatch, getState) => {
  const { tenant } = getState().environment;

  if (!tenant) {
    // Must have tenant set
    return;
  }

  dispatch(workflowSlice.actions.startLoadingWorkflows());
  try {
    const workflowService = new WorkflowService(tenant);
    const workflows = await Promise.all(
      workflowIds.map((id) => workflowService.getWorkflowById(id))
    );

    dispatch(workflowSlice.actions.finishedLoadingWorkflows(workflows));
  } catch (e) {
    dispatch(workflowSlice.actions.failedLoadingWorkflows(e));
  }
};

export const createNewWorkflow = (chart: Chart): AppThunk => async (
  dispatch,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant and user set
    return;
  }

  const id = nanoid();
  const newWorkflow: Workflow = {
    id,
    name: `New Calculation`,
    nodes: [],
    connections: [],
  };

  dispatch(workflowSlice.actions.startStoringNewWorkflow());

  try {
    // Create the workflow
    const workflowService = new WorkflowService(tenant);
    workflowService.saveWorkflow(newWorkflow);

    // Attach this workflow to the current chart
    const nextWorkflowIds = [
      {
        id: newWorkflow.id,
        name: newWorkflow.name,
        color: getEntryColor(),
        enabled: true,
      } as ChartWorkflow,
      ...(chart.workflowCollection || []),
    ];

    const chartService = new ChartService(tenant, user);
    await chartService.setWorkflowsOnChart(chart.id, nextWorkflowIds);
    dispatch(workflowSlice.actions.storedNewWorkflow(newWorkflow));
    dispatch(
      chartSlice.actions.storedNewWorkflow({
        id: chart.id,
        changes: { workflowCollection: nextWorkflowIds },
      })
    );
  } catch (e) {
    dispatch(workflowSlice.actions.failedStoringNewWorkflow(e));
  }
};

export const createWorkflowFromTimeSeries = (
  chart: Chart,
  timeSeriesId: string
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  const chartTimeSeries = chart.timeSeriesCollection?.find(
    ({ id }) => timeSeriesId === id
  );

  if (!tenant || !user) {
    // Must have tenant and user set
    return;
  }

  const workflowId = nanoid();
  const inputNodeId = `${TimeSeriesReferenceNode.subtitle}-${nanoid()}`;
  const outputNodeId = `${OutputSeriesNode.subtitle}-${nanoid()}`;
  const connectionId = nanoid();

  const newWorkflow: Workflow = {
    id: workflowId,
    name: `${chartTimeSeries?.name} (workflow)`,
    nodes: [
      {
        id: inputNodeId,
        ...TimeSeriesReferenceNode,
        title: chartTimeSeries?.name,
        subtitle: `DATAPOINTS (${chartTimeSeries?.id})`,
        functionData: {
          timeSeriesExternalId: timeSeriesId,
        },
        x: 50,
        y: 50,
      },
      {
        id: outputNodeId,
        ...OutputSeriesNode,
        x: 800,
        y: 70,
      },
    ],
    connections: {
      [connectionId]: {
        id: connectionId,
        inputPin: {
          nodeId: outputNodeId,
          pinId: OutputSeriesNode.inputPins[0].id,
        },
        outputPin: {
          nodeId: inputNodeId,
          pinId: TimeSeriesReferenceNode.outputPins[0].id,
        },
      },
    },
  };

  dispatch(workflowSlice.actions.startStoringNewWorkflow());

  try {
    // Create the workflow
    const workflowService = new WorkflowService(tenant);
    workflowService.saveWorkflow(newWorkflow);

    // Attach this workflow to the current chart
    const nextWorkflowIds = [
      {
        id: newWorkflow.id,
        name: newWorkflow.name,
        color: getEntryColor(),
        enabled: true,
      } as ChartWorkflow,
      ...(chart.workflowCollection || []),
    ];

    const chartService = new ChartService(tenant, user);
    await chartService.setWorkflowsOnChart(chart.id, nextWorkflowIds);
    dispatch(workflowSlice.actions.storedNewWorkflow(newWorkflow));
    dispatch(
      chartSlice.actions.storedNewWorkflow({
        id: chart.id,
        changes: { workflowCollection: nextWorkflowIds },
      })
    );
  } catch (e) {
    dispatch(workflowSlice.actions.failedStoringNewWorkflow(e));
  }
};

export const saveExistingWorkflow = (workflow: Workflow): AppThunk => async (
  _,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);

  if (!tenant) {
    // Must have tenant set
    return;
  }

  try {
    // Create the workflow
    const workflowService = new WorkflowService(tenant);

    // Make sure we don't store the latest run details
    const workflowToSave = { ...workflow };
    delete workflowToSave.latestRun; // Firestore HATES undefined values, so lets remove it entirely.
    workflowService.saveWorkflow(workflowToSave);
    toast.success('Workflow saved!');
  } catch (e) {
    toast.error('Failed to save workflow');
  }
};

export const deleteWorkflow = (
  chart: Chart,
  oldWorkflow: Workflow
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant set
    return;
  }

  try {
    // Delete the workflow from the chart also
    const nextWorkflowIds = (chart.workflowCollection || []).filter(
      ({ id }) => id !== oldWorkflow.id
    );
    const chartService = new ChartService(tenant, user);
    chartService.setWorkflowsOnChart(chart.id, nextWorkflowIds);

    // Then delete the workflow
    const workflowService = new WorkflowService(tenant);
    await workflowService.deleteWorkflow(oldWorkflow);

    // And save this all to redux
    dispatch(workflowSlice.actions.deleteWorkflow(oldWorkflow));
    dispatch(
      chartSlice.actions.storedNewWorkflow({
        id: chart.id,
        changes: { workflowCollection: nextWorkflowIds },
      })
    );
    toast.success('Workflow deleted!');
  } catch (e) {
    toast.error('Failed to delete workflow');
  }
};
