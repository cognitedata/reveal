import { waitFor, fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import {
  FloatingActions,
  SEARCH_BUTTON,
  DELETE_BUTTON,
} from '../FloatingActions';

describe('FloatingActions', () => {
  const page = (viewProps?: any) =>
    testRenderer(FloatingActions, undefined, viewProps);

  let handleSearchClicked: any;
  let handleRemoveFeature: any;
  beforeEach(() => {
    handleSearchClicked = jest.fn();
    handleRemoveFeature = jest.fn();
  });

  const defaultTestInit = async () => {
    return {
      ...page({
        handleSearchClicked,
        handleRemoveFeature,
      }),
    };
  };

  test('callback for search', async () => {
    await defaultTestInit();

    const searchButton = await waitFor(() =>
      screen.findByTestId(SEARCH_BUTTON)
    );

    expect(searchButton).toBeTruthy();

    fireEvent.click(searchButton);

    expect(handleSearchClicked.mock.calls.length).toEqual(1);
  });

  test('callback for delete', async () => {
    await defaultTestInit();

    const deleteButton = await waitFor(() =>
      screen.findByTestId(DELETE_BUTTON)
    );

    expect(deleteButton).toBeTruthy();

    fireEvent.click(deleteButton);

    expect(handleRemoveFeature.mock.calls.length).toEqual(1);
  });
});
