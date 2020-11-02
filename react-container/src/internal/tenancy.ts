import { KEY_LAST_TENANT, storage } from '../utils/localStorage';

/**
 * Parse tenancy information from the URL -- the entire URL (host & path) if
 * necessary.
 *
 * @param {any} location {@code window.location}
 * @return {string} the tenant name, or {@code ''} if one is not present
 */
export const getTenancy = (
  { pathname }: Location = window.location
): string => {
  if (!pathname) {
    return '';
  }

  // split strings on 'something/'
  const match = pathname.match(/^\/([a-z0-9-]+)\/?/);

  if (!match) {
    return '';
  }

  return match[1];
};

// -TODO: add check: according to CDF the tenant string is between 3 and 32 characters
export const sanitizeTenant = (tenant: string): string =>
  (tenant || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

export const getLastTenant = (): string => {
  return storage.getRootString<string, string>(KEY_LAST_TENANT, '') || '';
};

export const getTenantInfo = (location?: Location) => {
  const possibleTenant = getTenancy(location);
  const sanitizedTenant = sanitizeTenant(possibleTenant);

  return [possibleTenant, sanitizedTenant, getLastTenant()];
};
