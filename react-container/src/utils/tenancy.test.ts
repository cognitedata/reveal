import { getTenancy, sanitizeTenant } from './tenancy';

describe('tenancy', () => {
  describe('sanitizeTenant', () => {
    it('should be ok without any tenant name', () => {
      expect(sanitizeTenant('')).toEqual('');
    });

    it('should strip any url encoding', () => {
      expect(sanitizeTenant('%tenant%name')).toEqual('tenantname');
    });

    it('should convert to lowercase', () => {
      expect(sanitizeTenant('TEST')).toEqual('test');
    });
  });

  describe('getTenancy', () => {
    it('should be ok without any pathname', () => {
      const result = getTenancy({ pathname: '' } as Location);
      expect(result).toEqual('');
    });

    it('should be ok without any tenant', () => {
      const result = getTenancy({ pathname: '/' } as Location);
      expect(result).toEqual('');
    });

    it('should extract test-tenant from /test-tenant', () => {
      const result = getTenancy({ pathname: '/test-tenant' } as Location);
      expect(result).toEqual('test-tenant');
    });

    it('should extract test-tenant from /test-tenant/someRoute', () => {
      const result = getTenancy({
        pathname: '/test-tenant/someRoute',
      } as Location);
      expect(result).toEqual('test-tenant');
    });

    it('should parse myapp.cogniteapp.com/test-tenant to test-tenant', () => {
      const result = getTenancy({
        hostname: 'myapp.cogniteapp.com',
        pathname: '/test-tenant',
      } as Location);
      expect(result).toEqual('test-tenant');
    });

    it('should parse myapp.cogniteapp.com/test-tenant/someRoute to test-tenant', () => {
      const result = getTenancy({
        hostname: 'myapp.cogniteapp.com',
        pathname: '/test-tenant/someRoute',
      } as Location);
      expect(result).toEqual('test-tenant');
    });

    it('should parse myapp.cogniteapp.com/test-tenant/someRoute/-L123 to test-tenant', () => {
      const result = getTenancy({
        hostname: 'myapp.cogniteapp.com',
        pathname: '/test-tenant/someRoute/-L123',
      } as Location);
      expect(result).toEqual('test-tenant');
    });
  });
});
