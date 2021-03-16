import { nanoid } from 'nanoid';
import { Chart } from 'reducers/charts/types';
import { duplicate } from './charts';

describe('charts util', () => {
  describe('duplicate', () => {
    const id = nanoid();
    const chart: Chart = {
      id,
      name: 'test chart',
      user: 'user_1@example.org',
      public: true,
      dateFrom: 'then',
      dateTo: 'now',
    };
    it('should update the appropriate fields', () => {
      expect(duplicate(chart, 'user_2@example.org').public).toBe(false);
      expect(duplicate(chart, 'user_2@example.org').user).toEqual(
        'user_2@example.org'
      );
      expect(duplicate(chart, 'user_2@example.org').name).toEqual(
        'test chart Copy'
      );
      expect(duplicate(chart, 'user_2@example.org').id).not.toEqual(id);
    });
    it('should not update the other fields', () => {
      expect(duplicate(chart, 'user_2@example.org').dateFrom).toEqual('then');
      expect(duplicate(chart, 'user_2@example.org').dateTo).toEqual('now');
    });
  });
});
