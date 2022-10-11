import { mockPlants } from './test/mockPlants';
import { sortPlants } from './utils';

describe('Utils', () => {
  it('Shall sort plant by ordering', () => {
    const result = mockPlants.sort(sortPlants);
    expect(result.map((it) => it.displayName)).toEqual([
      'Plant2',
      'Plant4',
      'Plant1',
      'Plant3',
    ]);
  });
});
