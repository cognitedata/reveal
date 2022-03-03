import { getBackendServiceBaseUrl } from './config';

describe('config', () => {
  describe('getBackendServiceBaseUrl', () => {
    it('provides correct base url for localhost', () => {
      const baseUrl = getBackendServiceBaseUrl('https://localhost:3000');
      expect(baseUrl).toBe('https://calculation-backend.staging.cognite.ai/v3');
    });

    it('provides correct base url for default staging', () => {
      const baseUrl = getBackendServiceBaseUrl(
        'https://charts.staging.cogniteapp.com'
      );
      expect(baseUrl).toBe('https://calculation-backend.staging.cognite.ai/v3');
    });

    it('provides correct base url for default production', () => {
      const baseUrl = getBackendServiceBaseUrl('https://charts.cogniteapp.com');
      expect(baseUrl).toBe('https://calculation-backend.cognite.ai/v3');
    });

    it('provides correct base url for alternative cluster staging', () => {
      const baseUrl = getBackendServiceBaseUrl(
        'https://charts.staging.greenfield.cogniteapp.com'
      );
      expect(baseUrl).toBe(
        'https://calculation-backend.staging.greenfield.cognite.ai/v3'
      );
    });

    it('provides correct base url for alternative cluster production', () => {
      const baseUrl = getBackendServiceBaseUrl(
        'https://charts.greenfield.cogniteapp.com'
      );
      expect(baseUrl).toBe(
        'https://calculation-backend.greenfield.cognite.ai/v3'
      );
    });

    it('provides correct base url for alternative cluster staging + cluster key', () => {
      const baseUrl = getBackendServiceBaseUrl(
        'https://charts.staging.greenfield.cogniteapp.com',
        'greenfield'
      );
      expect(baseUrl).toBe(
        'https://calculation-backend.staging.greenfield.cognite.ai/v3'
      );
    });

    it('provides correct base url for alternative cluster production + cluster key', () => {
      const baseUrl = getBackendServiceBaseUrl(
        'https://charts.greenfield.cogniteapp.com',
        'greenfield'
      );
      expect(baseUrl).toBe(
        'https://calculation-backend.greenfield.cognite.ai/v3'
      );
    });
  });
});
