import {
  runFilterReducer,
  updateDateRangeAction,
  updateSearchAction,
  updateStatusAction,
} from 'hooks/runs/RunsFilterContext';

describe('RunsFilterContext', () => {
  const dateRange = {
    startDate: new Date(2021, 5, 17),
    endDate: new Date(2021, 5, 21),
  };
  const cases = [
    {
      field: 'statuses',
      action: updateStatusAction(['success']),
      otherFields: ['search', 'dateRange'],
      expected: ['success'],
    },
    {
      field: 'search',
      action: updateSearchAction('test search'),
      otherFields: ['statuses', 'dateRange'],
      expected: 'test search',
    },
    {
      field: 'dateRange',
      action: updateDateRangeAction(dateRange),
      otherFields: ['statuses', 'search'],
      expected: dateRange,
    },
  ];
  cases.forEach(({ field, action, expected, otherFields }) => {
    test(`runsFilterReducer - update ${field} state`, () => {
      const state = {};
      const res = runFilterReducer(state, action);
      expect(res[field]).toEqual(expected);
      // not change other fields
      otherFields.forEach((f) => {
        expect(res[f]).toEqual(state[f]);
      });
    });
  });
});
