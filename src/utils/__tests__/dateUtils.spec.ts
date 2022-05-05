import { getDateDiff } from 'src/utils/DateUtils';

describe('getDateDiff', () => {
  test('should give correct for durations < 24h', () => {
    const start = new Date(1648572981052); // 2022-03-29 16:56:21
    const end = new Date(1648597574414); // 2022-03-29 23:46:14

    expect(getDateDiff(start, end)).toBe('6 h 49 min 53 sec');
  });
  test('should give correct for durations > 24h', () => {
    const start = new Date(1651577937582); // 2022-05-03 11:38:57
    const end = new Date(1651666153356); // 2022-05-04 12:09:13

    expect(getDateDiff(start, end)).toBe('24 h 30 min 16 sec');
  });
});
