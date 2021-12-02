import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { AddToFavoriteSetMenu, Props } from '../AddToFavoriteSetMenu';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../AddSingleItem', () => ({
  AddSingleItem: () => <div data-testid="add-single-item">Single element</div>,
}));

jest.mock('../AddMultipleItems', () => ({
  AddMultipleItems: () => (
    <div data-testid="add-multiple-item">Multiple elements</div>
  ),
}));

describe('Add to favorite set', () => {
  const defaultTestInit = async (viewProps?: Props) =>
    testRenderer(AddToFavoriteSetMenu, undefined, viewProps);

  it(`should display single item`, async () => {
    await defaultTestInit({
      documentIds: [1],
      wellIds: [1],
    });
    const singleItem = screen.queryByTestId('add-single-item');
    expect(singleItem?.textContent).toEqual('Single element');
  });

  it(`should display multiple item`, async () => {
    await defaultTestInit({
      documentIds: [1, 2],
      wellIds: [1, 2],
    });
    const singleItem = screen.queryByTestId('add-multiple-item');
    expect(singleItem?.textContent).toEqual('Multiple elements');
  });
});
