import { getChipRightPropsForResourceCounter } from '../getChipRightPropsForResourceCounter';

describe('getChipRightPropsForResourceCounter', () => {
  it('should return expected output with isLoading true', () => {
    expect(
      getChipRightPropsForResourceCounter(10, true).chipRight
    ).toStrictEqual({
      icon: 'Loader',
      size: 'x-small',
    });
  });

  it('should return expected output with isLoading false', () => {
    const props = getChipRightPropsForResourceCounter(10, false).chipRight;
    expect(props).toHaveProperty('label', '10');
    expect(props).toHaveProperty('size', 'x-small');
    expect(props?.tooltipProps).toHaveProperty('content', '10');
  });
});
