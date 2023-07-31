import { setupServer } from 'msw/node';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { testRenderer } from '__test_utils__/testRenderer';
import { getMockNetworkUserSearch } from '__test_utils__/getMockNetworkUserSearch';

import { UserList } from '../UserList';

const TEST_USER_NAME = 'looking-for-this-user';

const networkMocks = setupServer(
  getMockNetworkUserSearch({ displayName: TEST_USER_NAME })
);

const userManagementServiceBaseUrl = 'https://localhost';

describe('UserList', () => {
  beforeAll(() => networkMocks.listen());
  afterAll(() => networkMocks.close());

  it('should initially load', async () => {
    const onSelect = jest.fn();
    testRenderer(UserList, {
      search: 'test',
      userManagementServiceBaseUrl,
      onSelect,
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should be ok in good case', async () => {
    const onSelect = jest.fn();
    testRenderer(UserList, {
      search: 'test',
      userManagementServiceBaseUrl,
      onSelect,
    });

    await waitFor(() => screen.findByText(TEST_USER_NAME));

    fireEvent.click(screen.getByText(TEST_USER_NAME));

    expect(onSelect).toBeCalledWith('1', TEST_USER_NAME);
  });
});
