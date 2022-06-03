import { getWorkflowSummaryById } from './selectors';
import { WorkflowResult } from './types';

describe('workflows(atom)', () => {
  describe('getWorkflowSummaryById', () => {
    it('works for empty collection', () => {
      const workflows: WorkflowResult[] = [];
      const workflowId: string = 'abc-123';
      const summary = getWorkflowSummaryById(workflows, workflowId);
      expect(summary).toEqual(undefined);
    });

    it('works for missing id', () => {
      const workflows: WorkflowResult[] = [];
      const workflowId = undefined;
      const summary = getWorkflowSummaryById(workflows, workflowId);
      expect(summary).toEqual(undefined);
    });

    it('works for id not present in collection', () => {
      const workflows: WorkflowResult[] = [
        { id: '123', datapoints: [], loading: false },
        { id: '124', datapoints: [], loading: false },
        { id: '125', datapoints: [], loading: false },
      ];
      const workflowId: string = 'id-that-does-not-exist-in-list';
      const summary = getWorkflowSummaryById(workflows, workflowId);
      expect(summary).toEqual(undefined);
    });

    it('calculates correct summary for found workflow', () => {
      const workflows: WorkflowResult[] = [
        {
          id: '123',
          loading: false,
          datapoints: [
            {
              timestamp: new Date(),
              value: -10,
            },
            {
              timestamp: new Date(),
              value: 0,
            },
            {
              timestamp: new Date(),
              value: 10,
            },
          ],
        },
        { id: '124', datapoints: [], loading: false },
        { id: '125', datapoints: [], loading: false },
      ];

      const workflowId: string = '123';

      const summary = getWorkflowSummaryById(workflows, workflowId);

      expect(summary).toEqual({ max: 10, mean: 0, min: -10 });
    });
  });
});
