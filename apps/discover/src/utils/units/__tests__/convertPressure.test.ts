import { convertPressure } from '../convertPressure';

describe('convertPressure', () => {
  it('should convert psi to ppg', () => {
    expect(convertPressure(100, 'psi', 200, 'm', 'ppg')).toEqual(
      2.93062621620988
    );
  });
  it('should convert psi to ppg (ft)', () => {
    expect(convertPressure(100, 'psi', 200, 'ft', 'ppg')).toEqual(
      9.615384615384615
    );
  });
});
