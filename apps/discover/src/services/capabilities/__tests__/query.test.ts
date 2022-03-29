import '__mocks/mockContainerAuth';
import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import { getMockTokenInspect } from '../__mocks/mockTokenInspect';
import { useCapabilitiesQuery } from '../query';

const mockServer = setupServer(getMockTokenInspect({ capabilities: ['READ'] }));
describe('useCapabilitiesQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected output with input', async () => {
    const { result, waitForNextUpdate } = renderHookWithStore(() =>
      useCapabilitiesQuery()
    );
    await waitForNextUpdate();
    expect(result.current.data?.capabilities).toEqual(['READ']);
  });
});
