import { screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { SHARE_MODAL_REMOVE_BUTTON_TEXT } from 'pages/authorized/favorites/modals/constants';

import { SharedUsersList, Props } from '../SharedUsersList';

const onRemove = jest.fn();

const defaultProps = {
  users: [
    {
      id: '1',
      firstname: 'Test',
      lastname: 'User',
      email: 'test.user@cognite.com',
    },
    {
      id: '2',
      firstname: 'Test',
      lastname: 'User 2',
      email: 'test.user2@cognite.com',
    },
  ],
  onRemove,
};

describe('Shared Users List', () => {
  const page = (viewStore: Store, props: Props) =>
    testRendererModal(SharedUsersList, viewStore, props);

  const defaultTestInit = async (props: Props) => {
    const store = getMockedStore();

    return { ...page(store, props), store };
  };

  it(`should display shared users count`, async () => {
    await defaultTestInit(defaultProps);
    const headerText = screen.getByText('Shared with (2)');
    expect(headerText).toBeInTheDocument();
  });

  it(`should display owner indicator`, async () => {
    await defaultTestInit(defaultProps);
    const headerText = screen.getByText('Owner');
    expect(headerText).toBeInTheDocument();
  });

  it(`should display users names and emails`, async () => {
    await defaultTestInit(defaultProps);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test User 2')).toBeInTheDocument();

    expect(screen.getByText('test.user@cognite.com')).toBeInTheDocument();
    expect(screen.getByText('test.user2@cognite.com')).toBeInTheDocument();
  });

  it(`should trigger 'remove' callback on remove`, async () => {
    await defaultTestInit(defaultProps);
    const button = screen.getByText(SHARE_MODAL_REMOVE_BUTTON_TEXT);
    if (button) {
      fireEvent.click(button);
    }
    expect(onRemove).toBeCalledTimes(1);
  });
});
