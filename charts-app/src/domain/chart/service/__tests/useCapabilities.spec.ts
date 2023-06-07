import { setupServer } from 'msw/node';
import { renderHookWithWrapper } from 'tests/testUtils';
import { useCapabilities, useExperimentalCapabilitiesCheck } from '../queries';
import { getMockCapabilities } from '../__mocks/getMockCapabilities';

const mockServer = setupServer(getMockCapabilities());

describe('capabilities hooks', () => {
  beforeAll(() => mockServer.listen());
  afterEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  describe('useCapabilities', () => {
    it('should return capabilities', async () => {
      const { result, waitFor } = renderHookWithWrapper(() =>
        useCapabilities()
      );
      await waitFor(() => result.current.isLoading === false);
      const capabilities = result.current.data;
      expect(capabilities?.length).toBeGreaterThan(0);
      expect(
        // @ts-ignore acls are mutually exclusive
        capabilities?.find((capability) => capability.groupsAcl)
      ).toBeDefined();
    });
  });

  describe('useExperimentalCapabilitiesCheck', () => {
    it('should return true for valid experimentAcls', () => {
      const { result } = renderHookWithWrapper(() =>
        useExperimentalCapabilitiesCheck([
          'monitoringTaskApiExperiment',
          'alertsApiExperiment',
        ])
      );
      expect(result.current).toBeTruthy();
    });

    it('should return false for invalid experimentAcls', () => {
      const { result } = renderHookWithWrapper(() =>
        useExperimentalCapabilitiesCheck([
          'monitoringTaskApiExperiment',
          'not_present_experiment_acl',
        ])
      );
      expect(result.current).toBeFalsy();
    });
  });
});
