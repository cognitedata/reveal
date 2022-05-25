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

  return match[1].trim();
};
