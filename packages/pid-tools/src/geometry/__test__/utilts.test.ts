import { angleDifference } from '../utils';

describe('utils', () => {
  test('angleDifference directed', async () => {
    expect(angleDifference(0, 0, 'directed')).toBeCloseTo(0);
    expect(angleDifference(0, 10, 'directed')).toBeCloseTo(10);
    expect(angleDifference(0, 350, 'directed')).toBeCloseTo(-10);
    expect(angleDifference(0, 185, 'directed')).toBeCloseTo(-175);
    expect(angleDifference(190, 170, 'directed')).toBeCloseTo(-20);
    expect(Math.abs(angleDifference(270, 90, 'directed'))).toBeCloseTo(180);
  });

  test('angleDifference uniDirected', async () => {
    expect(angleDifference(0, 0, 'uniDirected')).toBeCloseTo(0);
    expect(angleDifference(90, 100, 'uniDirected')).toBeCloseTo(10);
    expect(angleDifference(90, 80, 'uniDirected')).toBeCloseTo(-10);
    expect(angleDifference(270, 90, 'uniDirected')).toBeCloseTo(0);
    expect(angleDifference(0, 185, 'uniDirected')).toBeCloseTo(5);
    expect(angleDifference(0, 175, 'uniDirected')).toBeCloseTo(-5);
    expect(angleDifference(270, 170, 'uniDirected')).toBeCloseTo(80);
    expect(angleDifference(350, 10, 'uniDirected')).toBeCloseTo(20);
  });
});
