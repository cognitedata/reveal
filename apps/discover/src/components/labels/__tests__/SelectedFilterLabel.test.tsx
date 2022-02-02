import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { SelectedFilterLabel, Props } from '../SelectedFilterLabel';

describe('Selected filter label', () => {
  const testInit = async (props: Props) =>
    testRenderer(SelectedFilterLabel, undefined, props);

  const props: Props = {
    onClick: jest.fn(),
    key: '',
    tag: 'testing-tag',
  };

  it('should render label as expected', async () => {
    await testInit(props);

    expect(screen.getByText(props.tag)).toBeInTheDocument();
  });

  it('should call `onClick` event once when the label is clicked once', async () => {
    await testInit(props);

    fireEvent.click(screen.getByText(props.tag));
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });
});
