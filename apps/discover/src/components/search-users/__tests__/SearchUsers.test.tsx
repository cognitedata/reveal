import {
  queryHelpers,
  fireEvent,
  screen,
  within,
  waitFor,
} from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { UMSService } from '../../../modules/api/ums/ums-service';
import {
  SearchUsers,
  Props,
  SHARED_USER_INPUT_PLACEHOLDER,
} from '../SearchUsers';

jest.mock('modules/api/ums/ums-service', () => ({
  UMSService: {
    search: jest.fn(),
  },
  getJsonHeaders: jest.fn(),
}));

describe('SearchUsers Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(SearchUsers, undefined, viewProps);
  it('should load users and trigger callback once selected', async () => {
    (UMSService.search as jest.Mock).mockImplementation(() =>
      Promise.resolve([{ id: 1, displayName: 'John Doe' }])
    );
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

    await waitFor(() => fireEvent.click(screen.getByText('John Doe')));
    expect(onUsersSelectedChange).toBeCalledTimes(1);
  });
});
