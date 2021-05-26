import {
  runFilterReducer,
  updateDateRangeAction,
  updateSearchAction,
  updateStatusAction,
} from 'hooks/runs/RunsFilterContext';
import { RunStatus } from 'utils/runsUtils';

describe('RunsFilterContext', () => {
  const dateRange = {
    startDate: new Date(2021, 5, 17),
    endDate: new Date(2021, 5, 21),
  };
  const cases = [
    {
      field: 'status',
      action: updateStatusAction(RunStatus.SUCCESS),
      otherFields: ['search', 'dateRange'],
      expected: RunStatus.SUCCESS,
    },
    {
      field: 'search',
      action: updateSearchAction('test search'),
      otherFields: ['status', 'dateRange'],
      expected: 'test search',
    },
    {
      field: 'dateRange',
      action: updateDateRangeAction(dateRange),
      otherFields: ['status', 'search'],
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
