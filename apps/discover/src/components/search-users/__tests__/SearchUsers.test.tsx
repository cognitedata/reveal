import {
  queryHelpers,
  fireEvent,
  screen,
  within,
  waitFor,
} from '@testing-library/react';
import { setupServer } from 'msw/node';

import { getMockUserSearch } from '__mocks/mockUmsSearch';
import { testRenderer } from '__test-utils/renderer';

import {
  SearchUsers,
  Props,
  SHARED_USER_INPUT_PLACEHOLDER,
} from '../SearchUsers';

const mockServer = setupServer(getMockUserSearch());

describe('SearchUsers Tests', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });

  const testInit = async (viewProps?: Props) =>
    testRenderer(SearchUsers, undefined, viewProps);

  it('should load users and trigger callback once selected', async () => {
    const onUsersSelectedChange = jest.fn();
    await testInit({
      onUsersSelectedChange,
      selectedOptions: [],
    });

    const searchContainer = screen.getByTestId('shared-user-autocomplete');
    expect(
      within(searchContainer).getByText(SHARED_USER_INPUT_PLACEHOLDER)
    ).toBeInTheDocument();

    const input = queryHelpers.queryByAttribute(
      'type',
      searchContainer,
      'text'
    );
    expect(input).toBeTruthy();

    if (input) {
      fireEvent.change(input, { target: { value: 'John' } });
    }

    await waitFor(() => {
      // eslint-disable-next-line testing-library/no-wait-for-side-effects
      fireEvent.click(screen.getByText('John Doe'));
    });
    expect(onUsersSelectedChange).toBeCalledTimes(1);
  });
});
