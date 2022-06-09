import '__mocks/mockContainerAuth';

import { getMockSavedSearchDelete } from 'domain/savedSearches/service/__mocks/getMockSavedSearchDelete';
import { getMockSavedSearchPut } from 'domain/savedSearches/service/__mocks/getMockSavedSearchPut';
import { getMockSavedSearchRemoveSharePost } from 'domain/savedSearches/service/__mocks/getMockSavedSearchRemoveSharePost';
import { getMockSavedSearchSharePost } from 'domain/savedSearches/service/__mocks/getMockSavedSearchSharePost';

import { act } from 'react-test-renderer';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import {
  requestBody,
  responseData,
  TEST_ID,
} from '../../../service/__fixtures/savedSearch';
import { useSavedSearchAddShareMutate } from '../useSavedSearchAddShareMutate';
import { useSavedSearchCreateMutate } from '../useSavedSearchCreateMutate';
import { useSavedSearchDeleteMutate } from '../useSavedSearchDeleteMutate';
import { useSavedSearchRemoveShareMutate } from '../useSavedSearchRemoveShareMutate';

const initiateTest = (hook: any) => {
  const { result } = renderHookWithStore(() => hook());
  return result.current;
};

describe('useSavedSearchAddShareMutate success state', () => {
  const mockServer = setupServer(getMockSavedSearchSharePost());

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected output with valid input', async () => {
    const { mutateAsync } = initiateTest(useSavedSearchAddShareMutate);

    await act(() =>
      mutateAsync(requestBody).then((response: any) => {
        expect(response).toEqual(responseData.data.savedSearch);
      })
    );
  });
});

describe('useSavedSearchAddShareMutate error state', () => {
  const mockServer = setupServer(getMockSavedSearchSharePost(false));

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return error when request fail', async () => {
    const { mutateAsync } = initiateTest(useSavedSearchAddShareMutate);

    await act(() =>
      mutateAsync(requestBody).then((response: any) => {
        expect(response).toEqual({
          error: true,
        });
      })
    );
  });
});

describe('useSavedSearchRemoveShareMutate', () => {
  const mockServer = setupServer(getMockSavedSearchRemoveSharePost());

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected result with valid request', async () => {
    const { mutateAsync } = initiateTest(useSavedSearchRemoveShareMutate);

    await act(() =>
      mutateAsync(requestBody).then((response: any) => {
        expect(response).toEqual({ success: true, data: responseData.data });
      })
    );
  });
});

describe('useSavedSearchDeleteMutate', () => {
  const mockServer = setupServer(getMockSavedSearchDelete());

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected result with input', async () => {
    const { mutateAsync } = initiateTest(useSavedSearchDeleteMutate);

    await act(() =>
      mutateAsync(TEST_ID).then((response: any) => {
        expect(response).toEqual({ success: true, data: responseData.data });
      })
    );
  });
});

describe('useSavedSearchCreateMutate Success', () => {
  const mockServer = setupServer(getMockSavedSearchPut());

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected result with success request', async () => {
    const { mutateAsync } = initiateTest(useSavedSearchCreateMutate);

    await act(() =>
      mutateAsync({ id: TEST_ID, body: requestBody }).then((response: any) => {
        expect(response).toEqual(responseData.data.savedSearch);
      })
    );
  });
});

describe('useSavedSearchCreateMutate Error', () => {
  const mockServer = setupServer(getMockSavedSearchPut(false));
  console.error = jest.fn(); // prevent error logs

  beforeAll(() => mockServer.listen());
  afterAll(() => {
    mockServer.close();
    jest.clearAllMocks();
  });

  it('should return expected result with unsuccessful request', async () => {
    const { mutateAsync } = initiateTest(useSavedSearchCreateMutate);

    await act(() =>
      mutateAsync({ id: TEST_ID, body: requestBody }).catch((error: any) => {
        // eslint-disable-next-line
        expect(error).toEqual({ success: false, data: responseData.data });
      })
    );
  });
});
