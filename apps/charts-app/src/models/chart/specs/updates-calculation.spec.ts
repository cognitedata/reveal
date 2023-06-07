import { Chart, ScheduledCalculation } from '../types';
import {
  addScheduledCalculation,
  removeScheduledCalculation,
} from '../updates-calculation';

describe('Scheduled Calculation', () => {
  it('should add a new scheduled calculation', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
      scheduledCalculationCollection: [],
      sourceCollection: [],
    };

    const newScheduledCalc: ScheduledCalculation = {
      id: 'sc-w-1',
      type: 'scheduledCalculation',
      version: 'v2',
      name: 'Scheduled Calc 1',
      color: 'red',
      enabled: true,
      settings: {
        autoAlign: true,
      },
    };

    const updatedChart = addScheduledCalculation(
      existingChart,
      newScheduledCalc
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      scheduledCalculationCollection: [
        {
          id: 'sc-w-1',
          type: 'scheduledCalculation',
          version: 'v2',
          name: 'Scheduled Calc 1',
          color: 'red',
          enabled: true,
          settings: {
            autoAlign: true,
          },
        },
      ],
      sourceCollection: [
        {
          id: 'sc-w-1',
          type: 'scheduledCalculation',
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should remove a scheduled calculation', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6ccbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'PSI Run on Schedule',
      scheduledCalculationCollection: [
        {
          id: 'sc-w-2',
          type: 'scheduledCalculation',
          version: 'v2',
          name: 'Scheduled Calc 1',
          color: 'red',
          enabled: true,
          settings: {
            autoAlign: true,
          },
        },
      ],
      sourceCollection: [
        {
          id: 'sc-w-2',
          type: 'scheduledCalculation',
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2022-11-12T20:21:40.881Z',
      dateFrom: '2023-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };
    const schedCalcId = 'sc-w-2';

    const updatedChart = removeScheduledCalculation(existingChart, schedCalcId);

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6ccbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'PSI Run on Schedule',
      scheduledCalculationCollection: [],
      sourceCollection: [],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2022-11-12T20:21:40.881Z',
      dateFrom: '2023-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });
});
