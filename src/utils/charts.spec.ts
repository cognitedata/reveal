import { ChartWorkflowV2 } from 'models/charts/charts/types/types';
import { formatCalculationsForDownload } from './charts';

describe('formatCalculationsForDownload', () => {
  it('should format calculations for download and assign new ids', () => {
    const calculations: ChartWorkflowV2[] = [
      {
        preferredUnit: 'f',
        enabled: true,
        name: 'Calc 2',
        settings: { autoAlign: true },
        createdAt: 1651571446637,
        flow: {
          elements: [
            {
              position: { x: 668, y: 116 },
              type: 'CalculationOutput',
              id: '00713834-3152-4999-ad9a-c840480c4b95',
            },
            {
              position: { y: 103.88189697265625, x: 141.99996948242188 },
              data: {
                type: 'workflow',
                selectedSourceId: '95918a9031414d84b914f5b10b0f528c',
              },
              id: '4073f59d-7524-4125-9b66-9503931fa0c2',
              type: 'CalculationInput',
            },
            {
              sourceHandle: 'result',
              target: '00713834-3152-4999-ad9a-c840480c4b95',
              source: '4073f59d-7524-4125-9b66-9503931fa0c2',
              id: 'reactflow__edge-4073f59d-7524-4125-9b66-9503931fa0c2result-00713834-3152-4999-ad9a-c840480c4b95datapoints',
              targetHandle: 'datapoints',
            },
          ],
          position: [0, 0],
          zoom: 1,
        },
        version: 'v2',
        lineWeight: 1,
        type: 'workflow',
        id: '3be078ce90c944ba813c6a4897ac3c88',
        color: '#570408',
        range: [0.0015389935750206492, 0.002670382269274595],
        unit: 'f',
        calls: [
          {
            id: '3bd33744-7d6e-45c3-8dfd-9f9bbb40bb9f',
            status: 'Pending',
            callId: '3bd33744-7d6e-45c3-8dfd-9f9bbb40bb9f',
            callDate: 1652278834786,
            hash: 1446273990,
          },
        ],
        lineStyle: 'solid',
      },
      {
        color: '#198038',
        lineStyle: 'solid',
        range: [0.0020203478717282053, 0.0030417509339504133],
        settings: { autoAlign: true },
        unit: 'c',
        version: 'v2',
        type: 'workflow',
        name: 'Calc 1',
        flow: {
          position: [-16.336588747548603, -61.145688125477704],
          zoom: 0.8434061243738573,
          elements: [
            {
              position: { x: 641, y: 150 },
              id: '3fc490af-e76b-4400-b93c-08856f5f8e68',
              type: 'CalculationOutput',
            },
            {
              id: '237f3f88-acd7-4f87-8f18-8f25bcb04a6e',
              position: { y: 131.88189697265625, x: 155.99996948242188 },
              type: 'CalculationInput',
              data: {
                type: 'timeseries',
                selectedSourceId: '0b12720e-db2e-4a8a-af19-3036b52ad056',
              },
            },
            {
              source: '237f3f88-acd7-4f87-8f18-8f25bcb04a6e',
              id: 'reactflow__edge-237f3f88-acd7-4f87-8f18-8f25bcb04a6eresult-3fc490af-e76b-4400-b93c-08856f5f8e68datapoints',
              target: '3fc490af-e76b-4400-b93c-08856f5f8e68',
              targetHandle: 'datapoints',
              sourceHandle: 'result',
            },
          ],
        },
        calls: [
          {
            id: 'def17ffe-a908-4684-9cba-2dac37119a85',
            status: 'Pending',
            callId: 'def17ffe-a908-4684-9cba-2dac37119a85',
            callDate: 1652278815396,
            hash: 1446273990,
          },
        ],
        createdAt: 1651571460974,
        lineWeight: 1,
        enabled: true,
        preferredUnit: 'c',
        id: '95918a9031414d84b914f5b10b0f528c',
      },
    ];

    let currentId = 0;
    // eslint-disable-next-line no-plusplus
    const getNextId = () => {
      currentId += 1;
      return String(currentId);
    };

    const formattedCalculations = formatCalculationsForDownload(
      calculations,
      getNextId
    );

    expect(formattedCalculations).toEqual([
      {
        preferredUnit: 'f',
        enabled: true,
        name: 'Calc 2',
        settings: {
          autoAlign: true,
        },
        createdAt: 1651571446637,
        flow: {
          elements: [
            {
              position: {
                x: 668,
                y: 116,
              },
              type: 'CalculationOutput',
              id: '00713834-3152-4999-ad9a-c840480c4b95',
            },
            {
              position: {
                y: 103.88189697265625,
                x: 141.99996948242188,
              },
              data: {
                type: 'workflow',
                selectedSourceId: '2',
              },
              id: '4073f59d-7524-4125-9b66-9503931fa0c2',
              type: 'CalculationInput',
            },
            {
              sourceHandle: 'result',
              target: '00713834-3152-4999-ad9a-c840480c4b95',
              source: '4073f59d-7524-4125-9b66-9503931fa0c2',
              id: 'reactflow__edge-4073f59d-7524-4125-9b66-9503931fa0c2result-00713834-3152-4999-ad9a-c840480c4b95datapoints',
              targetHandle: 'datapoints',
            },
          ],
          position: [0, 0],
          zoom: 1,
        },
        version: 'v2',
        lineWeight: 1,
        type: 'workflow',
        id: '1',
        color: '#570408',
        range: [0.0015389935750206492, 0.002670382269274595],
        unit: 'f',
        calls: [
          {
            id: '3bd33744-7d6e-45c3-8dfd-9f9bbb40bb9f',
            status: 'Pending',
            callId: '3bd33744-7d6e-45c3-8dfd-9f9bbb40bb9f',
            callDate: 1652278834786,
            hash: 1446273990,
          },
        ],
        lineStyle: 'solid',
      },
      {
        color: '#198038',
        lineStyle: 'solid',
        range: [0.0020203478717282053, 0.0030417509339504133],
        settings: {
          autoAlign: true,
        },
        unit: 'c',
        version: 'v2',
        type: 'workflow',
        name: 'Calc 1',
        flow: {
          position: [-16.336588747548603, -61.145688125477704],
          zoom: 0.8434061243738573,
          elements: [
            {
              position: {
                x: 641,
                y: 150,
              },
              id: '3fc490af-e76b-4400-b93c-08856f5f8e68',
              type: 'CalculationOutput',
            },
            {
              id: '237f3f88-acd7-4f87-8f18-8f25bcb04a6e',
              position: {
                y: 131.88189697265625,
                x: 155.99996948242188,
              },
              type: 'CalculationInput',
              data: {
                type: 'timeseries',
                selectedSourceId: '0b12720e-db2e-4a8a-af19-3036b52ad056',
              },
            },
            {
              source: '237f3f88-acd7-4f87-8f18-8f25bcb04a6e',
              id: 'reactflow__edge-237f3f88-acd7-4f87-8f18-8f25bcb04a6eresult-3fc490af-e76b-4400-b93c-08856f5f8e68datapoints',
              target: '3fc490af-e76b-4400-b93c-08856f5f8e68',
              targetHandle: 'datapoints',
              sourceHandle: 'result',
            },
          ],
        },
        calls: [
          {
            id: 'def17ffe-a908-4684-9cba-2dac37119a85',
            status: 'Pending',
            callId: 'def17ffe-a908-4684-9cba-2dac37119a85',
            callDate: 1652278815396,
            hash: 1446273990,
          },
        ],
        createdAt: 1651571460974,
        lineWeight: 1,
        enabled: true,
        preferredUnit: 'c',
        id: '2',
      },
    ]);
  });
});
