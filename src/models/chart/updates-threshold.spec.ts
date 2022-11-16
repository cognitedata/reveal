import { Chart, ChartThreshold } from './types';
import {
  addChartThreshold,
  removeChartThreshold,
  updateChartThresholdEventFilters,
  updateChartThresholdLowerLimit,
  updateChartThresholdName,
  updateChartThresholdSelectedSource,
  updateChartThresholdType,
  updateChartThresholdUpperLimit,
  updateChartThresholdVisibility,
  updateChartThresholdProperties,
} from './updates-threshold';

describe('Update Chart Thresholds', () => {
  it('should add a new threshold', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };

    const newThreshold: ChartThreshold = {
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
      name: 'New threshold',
      type: 'under',
      visible: true,
      filter: {},
    };

    const updatedChart = addChartThreshold(existingChart, newThreshold);

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should remove a threshold', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };
    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

    const updatedChart = removeChartThreshold(existingChart, thresholdID);

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should update threshold name', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };
    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';
    const thresholdName = 'Threshold Updated Name';

    const updatedChart = updateChartThresholdName(
      existingChart,
      thresholdID,
      thresholdName
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'Threshold Updated Name',
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should update threshold visibility', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };
    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

    const updatedChart = updateChartThresholdVisibility(
      existingChart,
      thresholdID,
      false
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          type: 'under',
          visible: false,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should update threshold selected source', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          sourceId: '',
          name: 'New threshold',
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };
    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';
    const selectedSourceID = '1f358922-78a2-4547-8e99-f0e88e8f963b';

    const updatedChart = updateChartThresholdSelectedSource(
      existingChart,
      thresholdID,
      selectedSourceID
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          sourceId: '1f358922-78a2-4547-8e99-f0e88e8f963b',
          name: 'New threshold',
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should update threshold type', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };
    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';
    const updatedType = 'between';

    const updatedChart = updateChartThresholdType(
      existingChart,
      thresholdID,
      updatedType
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          type: 'between',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should update threshold lower limit', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          lowerLimit: 0,
          upperLimit: 0,
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };

    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

    const updatedChart = updateChartThresholdLowerLimit(
      existingChart,
      thresholdID,
      10
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          lowerLimit: 10,
          upperLimit: 0,
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should update threshold upper limit', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          lowerLimit: 0,
          upperLimit: 0,
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };

    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

    const updatedChart = updateChartThresholdUpperLimit(
      existingChart,
      thresholdID,
      10
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          lowerLimit: 0,
          upperLimit: 10,
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should update threshold event filters', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          lowerLimit: 0,
          upperLimit: 0,
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };

    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';
    const filters = {
      minValue: 0,
      maxValue: 1000,
      minUnit: 's',
      maxUnit: 'h',
    };

    const updatedChart = updateChartThresholdEventFilters(
      existingChart,
      thresholdID,
      filters
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          lowerLimit: 0,
          upperLimit: 0,
          type: 'under',
          visible: true,
          filter: {
            minValue: 0,
            maxValue: 1000,
            minUnit: 's',
            maxUnit: 'h',
          },
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });

  it('should update threshold properties', () => {
    const existingChart: Chart = {
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          lowerLimit: 10,
          upperLimit: 20,
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    };

    const thresholdID = 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d';

    const updatedChart = updateChartThresholdProperties(
      existingChart,
      thresholdID,
      { upperLimit: 30 }
    );

    expect(updatedChart).toEqual({
      version: 1,
      id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
      name: 'Demo: Power Consumption',
      thresholdCollection: [
        {
          id: 'bb6bdbcb-625f-4ef3-bac5-03cca61b064d',
          name: 'New threshold',
          lowerLimit: 10,
          upperLimit: 30,
          type: 'under',
          visible: true,
          filter: {},
        },
      ],
      user: 'shekhar.sharma@cognite.com',
      dateTo: '2021-11-12T20:21:40.881Z',
      dateFrom: '2020-04-25T07:05:31.547Z',
      createdAt: 1647350374178,
      updatedAt: 1651506075740,
    });
  });
});
