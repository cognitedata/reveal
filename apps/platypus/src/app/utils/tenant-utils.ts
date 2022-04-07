import config from '@platypus-app/config/config';

export const getTenant = (location = window.location) => {
  const { pathname } = location;
  const defaultTenant = 'platypus';
  if (!pathname) {
    return defaultTenant;
  }
  const match = pathname.match(/^\/([a-z0-9-]+)\/?/);
  if (!match) {
    return defaultTenant;
  }

  if (!config.WHITELISTED_TENANTS.includes(match[1])) {
    window.location.href = `${window.location.origin}/${defaultTenant}`;
    return;
  }
  return match[1].trim();
};
