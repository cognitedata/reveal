import { isHorizontal, isVertical, isLeft, isUp } from '../fileConnectionUtils';

describe('fileConnectionUtils', () => {
  test('isHorizontal', () => {
    expect(isHorizontal(0)).toEqual(true);
    expect(isHorizontal(90)).toEqual(false);
    expect(isHorizontal(180)).toEqual(true);
    expect(isHorizontal(270)).toEqual(false);
  });

  test('isVertical', () => {
    expect(isVertical(0)).toEqual(false);
    expect(isVertical(90)).toEqual(true);
    expect(isVertical(180)).toEqual(false);
    expect(isVertical(270)).toEqual(true);
  });

  test('isLeft', () => {
    expect(isLeft(0)).toEqual(false);
    expect(isLeft(90)).toEqual(false);
    expect(isLeft(180)).toEqual(true);
    expect(isLeft(270)).toEqual(false);
  });

  test('isUp', () => {
    expect(isUp(0)).toEqual(false);
    expect(isUp(90)).toEqual(false);
    expect(isUp(180)).toEqual(false);
    expect(isUp(270)).toEqual(true);
  });
});
