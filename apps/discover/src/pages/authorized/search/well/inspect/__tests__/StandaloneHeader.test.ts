import { screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { StandaloneHeader, Props } from '../StandaloneHeader';

const mockGoBack = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ goBack: mockGoBack }),
}));

describe('Well Inspect Standalone Header', () => {
  const page = (viewStore: Store, viewProps?: Props) =>
    testRenderer(StandaloneHeader, viewStore, viewProps);

  const defaultTestInit = async (viewProps: Props) => {
    const store = getMockedStore();

    return { ...page(store, viewProps), store };
  };

  it(`should render title`, async () => {
    const props = {
      title: 'Overview',
    };
    await defaultTestInit(props);
    const title = screen.getByText('Overview');
    expect(title).toBeInTheDocument();
  });

  it(`should not render header if hidden prop passed`, async () => {
    const props = {
      title: 'Overview',
      hidden: true,
    };
    await defaultTestInit(props);
    const title = screen.queryByText('Overview');
    expect(title).not.toBeInTheDocument();
  });

  it(`should go back on close button click`, async () => {
    const props = {
      title: 'Overview',
    };
    await defaultTestInit(props);
    const button = screen.getByTestId('standalone-header-close-btn');
    fireEvent.click(button);
    expect(mockGoBack).toBeCalledTimes(1);
  });
});
