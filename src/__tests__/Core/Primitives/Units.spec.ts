import { Units } from '@/Core/Primitives/Units';

const expectedMeters = 3048;
const expectedFeets = 10000;

describe('Units', () => {
  test('converts meter to feet', () => {
    expect(Units.convertMeterToFeet(expectedMeters)).toBe(expectedFeets);
  });
  test('converts feet to meter', () => {
    expect(Units.convertFeetToMeter(expectedFeets)).toBe(expectedMeters);
  })
});