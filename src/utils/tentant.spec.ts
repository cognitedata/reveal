import { getProject, sanitizeTenant } from './tenant';

describe('sanitizeTenant', () => {
  it('should sanitize tenants', () => {
    expect(sanitizeTenant('fusion')).toEqual('fusion');
    expect(sanitizeTenant('fUsIoN')).toEqual('fusion');
    expect(sanitizeTenant('fUsIoN-0942')).toEqual('fusion-0942');
  });
});

describe('getProject', () => {
  it('should get project/tenant from url', () => {
    expect(getProject('/fusion')).toEqual('fusion');
    expect(getProject('/fusion/chart/1')).toEqual('fusion');
    expect(getProject('/fusion')).toEqual('fusion');
    expect(getProject('/fusion/chart/1')).toEqual('fusion');
  });
});
