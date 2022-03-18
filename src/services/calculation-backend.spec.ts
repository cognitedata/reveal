/* eslint-disable global-require */
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
      process.env.REACT_APP_ENV = 'development';
      const baseUrl =
        require('./calculation-backend').getBackendServiceBaseUrl();
      expect(baseUrl).toBe('https://calculation-backend.staging.cognite.ai/v3');
    });

    it('provides correct base url for default staging', () => {
      process.env.REACT_APP_ENV = 'staging';
      const baseUrl =
        require('./calculation-backend').getBackendServiceBaseUrl();
      expect(baseUrl).toBe('https://calculation-backend.staging.cognite.ai/v3');
    });

    it('provides correct base url for default production', () => {
      process.env.REACT_APP_ENV = 'production';
      const baseUrl =
        require('./calculation-backend').getBackendServiceBaseUrl();
      expect(baseUrl).toBe('https://calculation-backend.cognite.ai/v3');
    });

    it('provides correct base url for alternative cluster staging', () => {
      process.env.REACT_APP_ENV = 'development';
      const baseUrl = require('./calculation-backend').getBackendServiceBaseUrl(
        'greenfield'
      );
      expect(baseUrl).toBe(
        'https://calculation-backend.staging.greenfield.cognite.ai/v3'
      );
    });

    it('provides correct base url for alternative cluster production', () => {
      process.env.REACT_APP_ENV = 'production';
      const baseUrl = require('./calculation-backend').getBackendServiceBaseUrl(
        'greenfield'
      );
      expect(baseUrl).toBe(
        'https://calculation-backend.greenfield.cognite.ai/v3'
      );
    });
  });
});
