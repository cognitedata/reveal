import { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { removeGroupFromCalculation, removeStepFromCalculation } from './utils';

describe('removeStepFromCalculation', () => {
  it('removes step', () => {
    const calculation: UserDefined = {
      dataModelVersion: '1.0.2',
      calculationType: 'UserDefined',
      calculationName: 'Minimal',
      simulator: 'PetroSIM',
      unitSystem: 'Refinery',
      modelName: 'Simple Crude Distillation Unit',
      userEmail: '',
      connector: 'symmetry',
      schedule: {
        enabled: true,
        start: 1695814164332,
        repeat: '1d',
      },
      dataSampling: {
        validationWindow: 1440,
        samplingWindow: 60,
        granularity: 1,
        validationEndOffset: '0m',
      },
      logicalCheck: {
        enabled: true,
        externalId: '',
        aggregateType: 'stepInterpolation',
        check: 'eq',
        value: 1,
      },
      steadyStateDetection: {
        enabled: true,
        externalId: '',
        aggregateType: 'average',
        minSectionSize: 60,
        varThreshold: 1,
        slopeThreshold: -3,
      },
      inputTimeSeries: [],
      inputConstants: [
        {
          name: 'Mat Stream Feed Temp - Constant',
          saveTimeseriesExternalId:
            'PetroSIM-INPUT-Minimal-MSFT0-Simple_Crude_Distillation_Unit',
          type: 'MSFT0',
          unit: 'kg/h',
          unitType: 'Mass Flow',
          value: '350',
        },
      ],
      outputTimeSeries: [
        {
          externalId:
            'PetroSIM-OUTPUT-Minimal-H0-Simple_Crude_Distillation_Unit',
          name: 'HeatFlow',
          type: 'H0',
          unit: 'Gcal/h',
          unitType: 'Heat Flow Large',
        },
        {
          externalId:
            'PetroSIM-OUTPUT-Minimal-T1-Simple_Crude_Distillation_Unit',
          name: 'Temp',
          type: 'T1',
          unit: 'C',
          unitType: 'Temperature',
        },
      ],
      routine: [
        {
          description: 'Pause',
          order: 1,
          steps: [
            {
              arguments: { type: 'Pause' },
              step: 1,
              type: 'Command',
            },
          ],
        },
        {
          description: 'Set',
          order: 2,
          steps: [
            {
              arguments: {
                objectName: 'Feed',
                objectProperty: 'Temp',
                objectType: 'Mat Stream',
                type: 'inputConstant',
                value: 'MSFT0',
              },
              step: 1,
              type: 'Set',
            },
          ],
        },
        {
          description: 'Solve',
          order: 3,
          steps: [
            {
              arguments: { type: 'Solve' },
              step: 1,
              type: 'Command',
            },
          ],
        },
        {
          description: 'Get',
          order: 4,
          steps: [
            {
              arguments: {
                objectName: 'Crude Duty',
                objectProperty: 'Heat Flow',
                objectType: 'En Stream',
                type: 'outputTimeSeries',
                value: 'H0',
              },
              step: 1,
              type: 'Get',
            },
            {
              arguments: {
                objectName: 'Atm Feed',
                objectProperty: 'Temp',
                objectType: 'Mat Stream',
                type: 'outputTimeSeries',
                value: 'T1',
              },
              step: 2,
              type: 'Get',
            },
          ],
        },
      ],
      outputSequences: [],
      calcTypeUserDefined: 'Abbreviated name',
    };

    expect(removeStepFromCalculation(calculation, 4, 2)).toEqual(
      expect.objectContaining({
        inputTimeSeries: [],
        inputConstants: [
          {
            name: 'Mat Stream Feed Temp - Constant',
            saveTimeseriesExternalId:
              'PetroSIM-INPUT-Minimal-MSFT0-Simple_Crude_Distillation_Unit',
            type: 'MSFT0',
            unit: 'kg/h',
            unitType: 'Mass Flow',
            value: '350',
          },
        ],
        outputTimeSeries: [
          {
            externalId:
              'PetroSIM-OUTPUT-Minimal-H0-Simple_Crude_Distillation_Unit',
            name: 'HeatFlow',
            type: 'H0',
            unit: 'Gcal/h',
            unitType: 'Heat Flow Large',
          },
        ],
        routine: [
          {
            description: 'Pause',
            order: 1,
            steps: [
              {
                arguments: { type: 'Pause' },
                step: 1,
                type: 'Command',
              },
            ],
          },
          {
            description: 'Set',
            order: 2,
            steps: [
              {
                arguments: {
                  objectName: 'Feed',
                  objectProperty: 'Temp',
                  objectType: 'Mat Stream',
                  type: 'inputConstant',
                  value: 'MSFT0',
                },
                step: 1,
                type: 'Set',
              },
            ],
          },
          {
            description: 'Solve',
            order: 3,
            steps: [
              {
                arguments: { type: 'Solve' },
                step: 1,
                type: 'Command',
              },
            ],
          },
          {
            description: 'Get',
            order: 4,
            steps: [
              {
                arguments: {
                  objectName: 'Crude Duty',
                  objectProperty: 'Heat Flow',
                  objectType: 'En Stream',
                  type: 'outputTimeSeries',
                  value: 'H0',
                },
                step: 1,
                type: 'Get',
              },
            ],
          },
        ],
      })
    );
  });
});

describe('removeGroupFromCalculation', () => {
  it('removes group', () => {
    const calculation: UserDefined = {
      dataModelVersion: '1.0.2',
      calculationType: 'UserDefined',
      calculationName: 'Minimal',
      simulator: 'PetroSIM',
      unitSystem: 'Refinery',
      modelName: 'Simple Crude Distillation Unit',
      userEmail: '',
      connector: 'symmetry',
      schedule: {
        enabled: true,
        start: 1695814164332,
        repeat: '1d',
      },
      dataSampling: {
        validationWindow: 1440,
        samplingWindow: 60,
        granularity: 1,
        validationEndOffset: '0m',
      },
      logicalCheck: {
        enabled: true,
        externalId: '',
        aggregateType: 'stepInterpolation',
        check: 'eq',
        value: 1,
      },
      steadyStateDetection: {
        enabled: true,
        externalId: '',
        aggregateType: 'average',
        minSectionSize: 60,
        varThreshold: 1,
        slopeThreshold: -3,
      },
      inputTimeSeries: [],
      inputConstants: [
        {
          name: 'Mat Stream Feed Temp - Constant',
          saveTimeseriesExternalId:
            'PetroSIM-INPUT-Minimal-MSFT0-Simple_Crude_Distillation_Unit',
          type: 'MSFT0',
          unit: 'kg/h',
          unitType: 'Mass Flow',
          value: '350',
        },
      ],
      outputTimeSeries: [
        {
          externalId:
            'PetroSIM-OUTPUT-Minimal-H0-Simple_Crude_Distillation_Unit',
          name: 'HeatFlow',
          type: 'H0',
          unit: 'Gcal/h',
          unitType: 'Heat Flow Large',
        },
        {
          externalId:
            'PetroSIM-OUTPUT-Minimal-T1-Simple_Crude_Distillation_Unit',
          name: 'Temp',
          type: 'T1',
          unit: 'C',
          unitType: 'Temperature',
        },
      ],
      routine: [
        {
          description: 'Pause',
          order: 1,
          steps: [
            {
              arguments: { type: 'Pause' },
              step: 1,
              type: 'Command',
            },
          ],
        },
        {
          description: 'Set',
          order: 2,
          steps: [
            {
              arguments: {
                objectName: 'Feed',
                objectProperty: 'Temp',
                objectType: 'Mat Stream',
                type: 'inputConstant',
                value: 'MSFT0',
              },
              step: 1,
              type: 'Set',
            },
          ],
        },
        {
          description: 'Solve',
          order: 3,
          steps: [
            {
              arguments: { type: 'Solve' },
              step: 1,
              type: 'Command',
            },
          ],
        },
        {
          description: 'Get',
          order: 4,
          steps: [
            {
              arguments: {
                objectName: 'Crude Duty',
                objectProperty: 'Heat Flow',
                objectType: 'En Stream',
                type: 'outputTimeSeries',
                value: 'H0',
              },
              step: 1,
              type: 'Get',
            },
            {
              arguments: {
                objectName: 'Atm Feed',
                objectProperty: 'Temp',
                objectType: 'Mat Stream',
                type: 'outputTimeSeries',
                value: 'T1',
              },
              step: 2,
              type: 'Get',
            },
          ],
        },
      ],
      outputSequences: [],
      calcTypeUserDefined: 'Abbreviated name',
    };

    expect(removeGroupFromCalculation(calculation, 4)).toEqual(
      expect.objectContaining({
        inputTimeSeries: [],
        inputConstants: [
          {
            name: 'Mat Stream Feed Temp - Constant',
            saveTimeseriesExternalId:
              'PetroSIM-INPUT-Minimal-MSFT0-Simple_Crude_Distillation_Unit',
            type: 'MSFT0',
            unit: 'kg/h',
            unitType: 'Mass Flow',
            value: '350',
          },
        ],
        outputTimeSeries: [],
        routine: [
          {
            description: 'Pause',
            order: 1,
            steps: [
              {
                arguments: { type: 'Pause' },
                step: 1,
                type: 'Command',
              },
            ],
          },
          {
            description: 'Set',
            order: 2,
            steps: [
              {
                arguments: {
                  objectName: 'Feed',
                  objectProperty: 'Temp',
                  objectType: 'Mat Stream',
                  type: 'inputConstant',
                  value: 'MSFT0',
                },
                step: 1,
                type: 'Set',
              },
            ],
          },
          {
            description: 'Solve',
            order: 3,
            steps: [
              {
                arguments: { type: 'Solve' },
                step: 1,
                type: 'Command',
              },
            ],
          },
        ],
      })
    );
  });
});
