import { fireEvent, screen, render } from '@testing-library/react';

import {
  FloatingActions,
  FLOATING_SEARCH_BUTTON_TEST_ID,
  FLOATING_DELETE_BUTTON_TEST_ID,
} from '../FloatingActions';

describe('FloatingActions', () => {
  const page = (viewProps?: any) => render(<FloatingActions {...viewProps} />);

  const onSearchClicked = jest.fn();
  const onDeleteClicked = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultTestInit = async () => {
    return {
      ...page({
        onSearchClicked,
        onDeleteClicked,
      }),
    };
  };

  test('callback for search', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByTestId(FLOATING_SEARCH_BUTTON_TEST_ID));

    expect(onSearchClicked.mock.calls.length).toEqual(1);
    expect(onDeleteClicked.mock.calls.length).toEqual(0);
  });

  test('callback for delete', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByTestId(FLOATING_DELETE_BUTTON_TEST_ID));

    expect(onSearchClicked.mock.calls.length).toEqual(0);
    expect(onDeleteClicked.mock.calls.length).toEqual(1);
  });
});
