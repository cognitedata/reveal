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
    expect(
      getChipRightPropsForResourceCounter(10, false).chipRight
    ).toStrictEqual({
      label: '10',
      size: 'x-small',
      tooltipProps: { content: '10' },
    });
  });
});
