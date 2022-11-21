import { Chart, ChartEventFilters } from '../types';
import {
  addEventFilters,
  initEventFilters,
  removeChartEventFilter,
  updateEventFiltersProperties,
} from '../updates-event-filters';

const ChartData: Chart = {
  version: 1,
  id: 'bb6bdbcb-625f-4ef3-bac5-03cca68b062d',
  name: 'Chart Event Test',
  user: 'shekhar.sharma@cognite.com',
  dateTo: '2021-11-12T20:21:40.881Z',
  dateFrom: '2020-04-25T07:05:31.547Z',
  createdAt: 1647350374178,
  updatedAt: 1651506075740,
};

const EventData: ChartEventFilters = {
  id: 'aa6bdbcb-625f-4ef3-bac5-03cca61b064d',
  name: 'Work order event filter',
  visible: true,
  filters: {},
};

describe('Update Chart Event Filters', () => {
  it('should initialise eventFilters to chart', () => {
    const existingChart: Chart = { ...ChartData };

    const updatedChart = initEventFilters(existingChart);

    expect(updatedChart).toEqual({
      ...ChartData,
      eventFilters: [],
    });
  });

  it('should add a new event', () => {
    const existingChart: Chart = {
      ...ChartData,
    };

    const newEvent: ChartEventFilters = { ...EventData };

    const updatedChart = addEventFilters(existingChart, newEvent);

    expect(updatedChart).toEqual({
      ...ChartData,
      eventFilters: [{ ...newEvent }],
    });
  });

  it('should remove an event', () => {
    const eventId = 'aa6bdbcb-625f-4ef3-bac5-03cca61b0123';
    const existingChart: Chart = {
      ...ChartData,
      eventFilters: [
        {
          ...EventData,
          id: eventId,
        },
      ],
    };

    const updatedChart = removeChartEventFilter(existingChart, eventId);

    expect(updatedChart).toEqual({
      ...ChartData,
      eventFilters: [],
    });
  });

  it('should update event properties', () => {
    const eventId = 'ef6bdbcb-625f-4ef3-bac5-03cca61b0123';
    const existingChart: Chart = {
      ...ChartData,
      eventFilters: [
        {
          ...EventData,
          name: 'Event one',
          id: 'ab6bdbcb-625f-4ef3-bac5-03cca61b0123',
        },
        {
          ...EventData,
          name: 'Event two',
          id: eventId,
        },
        {
          ...EventData,
          name: 'Event three',
          id: 'ad6bdbcb-625f-4ef3-bac5-03cca61b0123',
        },
      ],
    };

    const updateData = {
      name: 'Chart Event Updated Name',
    };

    const updatedChart = updateEventFiltersProperties(
      existingChart,
      eventId,
      updateData
    );

    expect(updatedChart).toEqual({
      ...existingChart,
      eventFilters: [
        {
          ...EventData,
          name: 'Event one',
          id: 'ab6bdbcb-625f-4ef3-bac5-03cca61b0123',
        },
        {
          ...EventData,
          id: eventId,
          ...updateData,
        },
        {
          ...EventData,
          name: 'Event three',
          id: 'ad6bdbcb-625f-4ef3-bac5-03cca61b0123',
        },
      ],
    });
  });

  it('should not update chart', () => {
    const eventId = 'en6bdbcb-625f-4ef3-bac5-03cca61b0123';
    const existingChart: Chart = {
      ...ChartData,
      eventFilters: [
        {
          ...EventData,
          id: eventId,
        },
      ],
    };

    const updatedChart = updateEventFiltersProperties(
      { ...existingChart },
      `${eventId}s`, // sending wrong id so that the above method doenst update the chart
      { name: 'new' } // same, sending wrong name
    );

    expect(updatedChart).toEqual({ ...existingChart });
  });
});
