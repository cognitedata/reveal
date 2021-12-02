import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Props, SearchInputValues } from '../SearchInputValues';

const onClick = jest.fn();

const defaultProps = {
  caption: 'Test Title',
  value: 'Test Value',
  onClick,
};

describe('SearchInputValues', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(SearchInputValues, undefined, viewProps);

  it('should render values', async () => {
    const { container } = await testInit(defaultProps);

    expect(container).toHaveTextContent(defaultProps.caption);
    expect(screen.getByText(defaultProps.value)).toBeInTheDocument();
  });

  it(`should trigger callback on remove click`, async () => {
    await testInit(defaultProps);
    const button = screen.getByTestId('remove-btn');
    fireEvent.click(button);
    expect(onClick).toBeCalledTimes(1);
  });
});
