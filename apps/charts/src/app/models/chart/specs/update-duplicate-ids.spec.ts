/**
 * npx jest ./src/models/chart/specs/update-duplicate-ids.spec.ts
 */

import { Edge } from 'react-flow-renderer';

import { mockChartWithDuplicateCalculationIds } from '../../calculation-results/mocks';
import { Chart, ChartWorkflow, ChartWorkflowV2 } from '../types';
import { updateDuplicateIds } from '../update-duplicate-ids';

jest.mock('../../../services/metrics', () => ({
  trackUsage: jest.fn(),
}));

describe('updateDuplicateIds function:', () => {
  let chart: Chart;

  beforeEach(() => {
    chart = updateDuplicateIds(
      JSON.parse(JSON.stringify(mockChartWithDuplicateCalculationIds))
    );
  });

  it('should not mutate the original mock data', () => {
    expect(chart).not.toEqual(mockChartWithDuplicateCalculationIds);
  });

  it('should only modify workflowCollection of the chart', () => {
    const { workflowCollection, ...restOfChart } = chart;
    const { workflowCollection: mockWorkflowCollection, ...restOfMock } =
      mockChartWithDuplicateCalculationIds;
    expect(restOfChart).toEqual(restOfMock);
  });

  it('should check each element id should be unique within all of workflow', () => {
    const allIds = chart?.workflowCollection?.flatMap((workflow) =>
      workflow.version === 'v2' && workflow.flow
        ? workflow.flow.elements.map((e) => e.id)
        : []
    );
    const uniqueIds = [...new Set(allIds)];
    expect(allIds?.length).toBe(uniqueIds.length);
  });

  it('should update all elements that reference old ids with new ids', () => {
    const allElements = chart?.workflowCollection?.flatMap((workflow) =>
      workflow.version === 'v2' && workflow.flow ? workflow.flow.elements : []
    );
    allElements?.forEach((element) => {
      const sourceExists =
        'source' in element
          ? allElements.some((e) => e.id === element.source)
          : true;
      const targetExists =
        'target' in element
          ? allElements.some((e) => e.id === element.target)
          : true;

      expect(sourceExists && targetExists).toBe(true);
    });
  });

  it('should fix all edge ids which contained valid element ids', () => {
    const allElements = chart?.workflowCollection?.flatMap((workflow) =>
      workflow.version === 'v2' && workflow.flow ? workflow.flow.elements : []
    );

    const edgeIds = allElements
      ?.filter((element) => element.id.includes('reactflow__edge'))
      .flatMap((element) => {
        const edgeParts = element.id.split('null-');
        return edgeParts.slice(1, edgeParts.length - 1);
      });

    edgeIds?.forEach((id) => {
      expect(allElements?.some((e) => e.id === id)).toBe(true);
    });
  });
});

describe('Verify chart data sanity', () => {
  let chart: Chart;

  beforeEach(() => {
    chart = updateDuplicateIds(
      JSON.parse(JSON.stringify(mockChartWithDuplicateCalculationIds))
    );
  });

  it('should preserve first calculation', () => {
    const { workflowCollection } = chart;
    if (!workflowCollection) return;

    const workflow = workflowCollection[0] as ChartWorkflowV2;
    if (!workflow || !workflow.flow) return;

    const { flow } = workflow;
    const { elements } = flow;
    expect(elements[0].id).toBe('calc-aa-id-1-output-element-1');
    expect((elements[0] as Edge).id).toBe((elements[6] as Edge).target);
    expect((elements[1] as Edge).id).toBe((elements[5] as Edge).source);
    expect(elements[5].id).toContain(elements[1].id);

    elements.forEach((element: any) => {
      if (!element.type && element.targetHandle) {
        const doesIdEndWithTargetHandle = element.id.endsWith(
          element.targetHandle
        );

        expect(doesIdEndWithTargetHandle).toBeTruthy();
      }
    });
  });

  it('should update duplicate calculation id and maintain node connection', () => {
    const { workflowCollection } = chart;
    if (!workflowCollection) return;

    const workflow = workflowCollection[1] as ChartWorkflowV2;
    if (!workflow || !workflow.flow) return;

    const { flow } = workflow;
    const { elements } = flow;
    expect((elements[0] as Edge).id).toBe((elements[6] as Edge).target);

    expect((elements[1] as Edge).id).toBe((elements[5] as Edge).source);
    expect((elements[5] as Edge).id).toContain((elements[1] as Edge).id);

    expect((elements[2] as Edge).id).toBe((elements[4] as Edge).source);
    expect((elements[4] as Edge).id).toContain((elements[2] as Edge).id);
  });

  it('should find items without type but with targetHandle, and verify their IDs', () => {
    const { workflowCollection } = chart;
    if (!workflowCollection) return;

    const workflow = workflowCollection[2] as ChartWorkflowV2;

    if (!workflow || !workflow.flow) return;

    const { flow } = workflow;
    const { elements } = flow;

    elements.forEach((element: any) => {
      if (!element.type && element.targetHandle) {
        const doesIdEndWithTargetHandle = element.id.endsWith(
          element.targetHandle
        );
        expect(doesIdEndWithTargetHandle).toBeTruthy();
      }
    });
  });

  it('should return the original chart without mutation if workflowCollection is empty', () => {
    const emptyChart: Chart = {
      id: 'empty-chart-id-1',
      name: 'Empty Chart',
      userInfo: {
        displayName: 'Shekhar  Sharma',
        id: 'abcdefgijklmn-1234-4567-a19c-e232e2c03a43',
        email: 'shekhar.sharma@cognitedata.com',
      },
      dateFrom: '2023-05-23T19:14:52.784Z',
      user: 'asdf-1234-4567-a19c-e232e2c03a43',
      version: 1,
      dateTo: '2023-06-23T19:14:52.784Z',
      createdAt: 1688304516913,
      updatedAt: 1688304516913,
    };

    const result = updateDuplicateIds(emptyChart);

    expect(result).toEqual(emptyChart);
  });
});
