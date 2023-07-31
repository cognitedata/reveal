import '__mocks/mockContainerAuth'; // should be first
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper } from '__test-utils/renderer';
import { defaultTestUser } from '__test-utils/testdata.utils';

import { useIsOwner } from '../useIsOwner';

const networkMocks = setupServer(getMockUserMe({ id: defaultTestUser }));

beforeAll(() => networkMocks.listen());
afterAll(() => networkMocks.close());
describe('useIsOwner', () => {
  it('should be ok', () => {
    const { result } = renderHook(() => useIsOwner(), {
      wrapper: testWrapper,
    });

    expect(result.current.isOwner('1')).toEqual(false);
  });
  it('should match user', async () => {
    const { result, waitFor } = renderHook(() => useIsOwner(), {
      wrapper: testWrapper,
    });
    await waitFor(() => expect(result.current.isFetched).toEqual(true));
    expect(result.current.isOwner(defaultTestUser)).toEqual(true);
  });
});
