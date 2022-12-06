/* eslint-disable global-require */

const mockIsProductionValueGetter = jest.fn();
jest.mock('utils/environment', () => ({
  get isProduction() {
    return mockIsProductionValueGetter();
  },
}));

describe('config', () => {
  describe('getBackendServiceBaseUrl', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('provides correct base url for no cluster in development', () => {
      mockIsProductionValueGetter.mockReturnValue(false);
      const baseUrl =
        require('./calculation-backend').getBackendServiceBaseUrl();
      expect(baseUrl).toBe('https://calculation-backend.staging.cognite.ai/v4');
    });

    it('provides correct base url for default staging', () => {
      mockIsProductionValueGetter.mockReturnValue(false);
      const baseUrl =
        require('./calculation-backend').getBackendServiceBaseUrl();
      expect(baseUrl).toBe('https://calculation-backend.staging.cognite.ai/v4');
    });

    it('provides correct base url for default production', () => {
      mockIsProductionValueGetter.mockReturnValue(true);
      const baseUrl =
        require('./calculation-backend').getBackendServiceBaseUrl();
      expect(baseUrl).toBe('https://calculation-backend.cognite.ai/v4');
    });

    it('provides correct base url for alternative cluster staging', () => {
      mockIsProductionValueGetter.mockReturnValue(false);
      const baseUrl = require('./calculation-backend').getBackendServiceBaseUrl(
        'greenfield'
      );
      expect(baseUrl).toBe(
        'https://calculation-backend.staging.greenfield.cognite.ai/v4'
      );
    });

    it('provides correct base url for alternative cluster production', () => {
      mockIsProductionValueGetter.mockReturnValue(true);
      const baseUrl = require('./calculation-backend').getBackendServiceBaseUrl(
        'greenfield'
      );
      expect(baseUrl).toBe(
        'https://calculation-backend.greenfield.cognite.ai/v4'
      );
    });
  });
});
