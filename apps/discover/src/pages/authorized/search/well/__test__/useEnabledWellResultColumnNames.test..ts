import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { useEnabledWellResultColumnNames } from '../useEnabledWellResultColumnNames';

const mockServer = setupServer(getMockConfigGet());

describe('useEnabledWellResultColumnNames hook', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected value with filter config data', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useEnabledWellResultColumnNames(),
      {
        wrapper: QueryClientWrapper,
      }
    );
    await waitForNextUpdate();

    expect(result.current).toEqual([
      'wellname',
      'source',
      'operator',
      'spudDate',
      'waterDepth',
    ]);
  });
});
