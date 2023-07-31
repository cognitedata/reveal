import { sortByCaseInsensitive } from '../sortByCaseInsensitive';

describe('Case insensitive sort', () => {
  test('Should sort by string', () => {
    expect(sortByCaseInsensitive('BP', 'Anadarko')).toEqual(1);
  });

  test('Should sort by number', () => {
    expect(sortByCaseInsensitive('2', '1')).toEqual(1);
  });

  test('Should support case insensitive sort', () => {
    expect(sortByCaseInsensitive('bp', 'Anadarko')).toEqual(1);
  });

  test('Should sort by number (reversed)', () => {
    expect(sortByCaseInsensitive('1', '2', true)).toEqual(1);
  });

  test('Should support case insensitive sort (reversed)', () => {
    expect(sortByCaseInsensitive('anadarko', 'BP', true)).toEqual(1);
  });
});
