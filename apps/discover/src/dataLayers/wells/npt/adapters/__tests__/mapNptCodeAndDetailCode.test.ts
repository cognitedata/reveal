import { mapNptCodeAndDetailCode } from '../mapNptCodeAndDetailCode';

describe('mapNptCodeAndDetailCode', () => {
  it('should return empty object', () => {
    expect(mapNptCodeAndDetailCode()).toEqual({});
  });

  it('should return expected output', () => {
    const result = mapNptCodeAndDetailCode([
      { legend: 'legend', id: 'id', event: 'event', type: 'type' },
      { legend: 'legend_2', id: 'id_2', event: 'event_2', type: 'type_2' },
    ]);

    expect(result).toMatchObject({ id: 'legend', id_2: 'legend_2' });
  });
});
