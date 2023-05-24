import { setupServer } from 'msw/node';
import { renderHook } from '@testing-library/react-hooks';
import { testQueryClientWrapper as wrapper } from '@data-exploration-lib/core';
import {
  getMock3DRevisions,
  mockModelObj,
} from '../../../__mocks/getMock3DRevisions';
import { jest } from '@jest/globals';
import {
  mock3dRevisions,
  newestRevision,
} from '../../../__fixtures/mock3dRevisions';
import { useDefault3DModelRevision } from '../useDefault3DModelRevision';

const mockServer = setupServer(getMock3DRevisions());
describe('useDefault3DModelRevision', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });

  it('should be okay when all results are not published', async () => {
    const { result, waitFor } = renderHook(
      () => useDefault3DModelRevision(mockModelObj.id),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.isLoading).toEqual(false), {
      timeout: 10000,
    });

    expect(result.current.data?.id).toEqual(newestRevision.id);
  });

  it('should be okay when one revision is published', async () => {
    const mockPublishedRevision = mock3dRevisions.items[0];

    jest.mock('../../../__fixtures/mock3dRevisions', () => {
      return {
        mock3dRevisions: () => [
          ...mock3dRevisions.items.filter(
            (rev) => rev.id === mockPublishedRevision.id
          ),
          { ...mockPublishedRevision, published: true },
        ],
      };
    });

    const { result, waitFor } = renderHook(
      () => useDefault3DModelRevision(mockModelObj.id),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.isLoading).toEqual(false), {
      timeout: 10000,
    });

    expect(result.current.data?.id).toEqual(mockPublishedRevision.id);
  });

  it('should be okay when more than one revision is published', async () => {
    const mockPublishedRevision1 = mock3dRevisions.items[0];
    const mockPublishedRevision2 = mock3dRevisions.items[1];

    jest.mock('../../../__fixtures/mock3dRevisions', () => {
      return {
        mock3dRevisions: () => [
          ...mock3dRevisions.items.filter(
            (rev) =>
              ![mockPublishedRevision1.id, mockPublishedRevision2.id].includes(
                rev.id
              )
          ),
          { ...mockPublishedRevision1, published: true },
          { ...mockPublishedRevision2, published: true },
        ],
      };
    });

    const { result, waitFor } = renderHook(
      () => useDefault3DModelRevision(mockModelObj.id),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current.isLoading).toEqual(false), {
      timeout: 10000,
    });

    expect(result.current.data?.id).toEqual(mockPublishedRevision1.id);
  });
});
