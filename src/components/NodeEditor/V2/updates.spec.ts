import { ChartWorkflowV2 } from 'models/chart/types';
import { updateFlowSettings, updateWorkflowName } from './updates';

describe('updateWorkflowName', () => {
  it('should update name correctly', () => {
    const workflow: ChartWorkflowV2 = {
      id: 'workflow-1',
      name: 'Original Calc Name',
      color: '#1192e8',
      enabled: true,
      flow: {
        zoom: 1,
        elements: [],
        position: [0, 0],
      },
      version: 'v2',
      settings: { autoAlign: true },
    };

    const newWorkflowName = 'New Calc Name';

    const updatedWorkflow = updateWorkflowName(workflow, newWorkflowName);

    expect(updatedWorkflow).toEqual({
      id: 'workflow-1',
      name: 'New Calc Name',
      color: '#1192e8',
      enabled: true,
      flow: {
        zoom: 1,
        elements: [],
        position: [0, 0],
      },
      version: 'v2',
      settings: { autoAlign: true },
    });
  });
});

describe('updateFlowSettings', () => {
  it('should update settings correctly', () => {
    const workflow: ChartWorkflowV2 = {
      id: 'workflow-1',
      name: 'Original Calc Name',
      color: '#1192e8',
      enabled: true,
      flow: {
        zoom: 1,
        elements: [],
        position: [0, 0],
      },
      version: 'v2',
      settings: { autoAlign: true },
    };

    const updatedWorkflow = updateFlowSettings(workflow, { autoAlign: false });

    expect(updatedWorkflow).toEqual({
      id: 'workflow-1',
      name: 'Original Calc Name',
      color: '#1192e8',
      enabled: true,
      flow: {
        zoom: 1,
        elements: [],
        position: [0, 0],
      },
      version: 'v2',
      settings: { autoAlign: false },
    });
  });
});
