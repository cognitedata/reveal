const sanitizeTenant = (tenant: string = '') =>
  tenant.toLowerCase().replace(/[^a-z0-9-]/g, '');

export const getTenantFromURL = () =>
  sanitizeTenant(window.location.pathname.match(/^\/([^/]*)(.*)$/)?.[1]);
