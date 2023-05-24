import { setupServer } from 'msw/node';
import { renderHook } from '@testing-library/react-hooks';
import { testQueryClientWrapper as wrapper } from '@data-exploration-lib/core';
import {
  getMock3DRevisions,
  mockModelObj,
} from '../../../__mocks/getMock3DRevisions';
import { use3DRevisionsQuery } from '../use3DRevisionsQuery';

const mockServer = setupServer(getMock3DRevisions());
describe('use3DRevisionsQuery', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should be okay', async () => {
    const { result, waitFor } = renderHook(
      () => use3DRevisionsQuery(mockModelObj.id),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.isLoading).toEqual(false), {
      timeout: 10000,
    });

    expect(result.current.data?.length).toEqual(6);
  });
});
