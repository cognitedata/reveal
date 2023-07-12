/** Test Workflow Duplication */
import { CalculationDeepCloneAndReplaceIds } from './calculations';

describe('Duplicate Calculation', () => {
  const calculation = {
    version: 'v2',
    id: '12804f3c-076b-43d1-81bd-cfb8120975b8',
    name: 'A Copy',
    color: '#6929c4',
    flow: {
      elements: [
        {
          id: 'a72ebf79-78d8-4c7c-b82e-168172f55879',
          type: 'CalculationOutput',
          position: {
            x: 736,
            y: 186,
          },
        },
        {
          id: 'a9be893f-757c-4538-af37-3c65f3eec678',
          type: 'Constant',
          data: {
            value: 2,
          },
          position: {
            x: 54,
            y: 149,
          },
        },
        {
          id: '684d8ff4-3c22-4126-bbfc-b498a23ee744',
          type: 'Constant',
          data: {
            value: 3,
          },
          position: {
            x: 19,
            y: 268,
          },
        },
        {
          id: '26ee0d01-725a-4125-a1b8-9da1f095cade',
          type: 'ToolboxFunction',
          data: {
            selectedOperation: {
              op: 'add',
              version: '1.0',
            },
            parameterValues: {},
          },
          position: {
            x: 369,
            y: 198,
          },
        },
        {
          source: 'a9be893f-757c-4538-af37-3c65f3eec678',
          sourceHandle: null,
          target: '26ee0d01-725a-4125-a1b8-9da1f095cade',
          targetHandle: 'a',
          id: 'reactflow__edge-a9be893f-757c-4538-af37-3c65f3eec678null-26ee0d01-725a-4125-a1b8-9da1f095cadea',
        },
        {
          source: '684d8ff4-3c22-4126-bbfc-b498a23ee744',
          sourceHandle: null,
          target: '26ee0d01-725a-4125-a1b8-9da1f095cade',
          targetHandle: 'b',
          id: 'reactflow__edge-684d8ff4-3c22-4126-bbfc-b498a23ee744null-26ee0d01-725a-4125-a1b8-9da1f095cadeb',
        },
        {
          source: '26ee0d01-725a-4125-a1b8-9da1f095cade',
          sourceHandle: 'out-result-0',
          target: 'a72ebf79-78d8-4c7c-b82e-168172f55879',
          targetHandle: 'datapoints',
          id: 'reactflow__edge-26ee0d01-725a-4125-a1b8-9da1f095cadeout-result-0-a72ebf79-78d8-4c7c-b82e-168172f55879datapoints',
        },
      ],
      position: [21, -37],
      zoom: 1,
    },
    lineWeight: 1,
    lineStyle: 'solid',
    enabled: true,
    createdAt: 1686649760771,
    unit: '',
    preferredUnit: '',
    settings: {
      autoAlign: true,
    },
    type: 'workflow',
  };

  // @ts-ignore
  const cloneCalculation = CalculationDeepCloneAndReplaceIds(calculation);

  it('should duplicate a calculation', () => {
    expect(cloneCalculation).not.toBe(calculation);
  });

  it('should have unique ID for flow elements', () => {
    // loop through all edges
    if (cloneCalculation && cloneCalculation.flow) {
      for (let i = 0; i < cloneCalculation.flow.elements.length; i++) {
        const cloneElement = cloneCalculation.flow.elements[i];
        const originalElement = calculation.flow.elements[i];
        // check if element is an edge
        if (cloneElement.type) {
          // check if edge id is the same
          expect(cloneElement.id).not.toBe(originalElement.id);
        }
      }
    }
  });
});
