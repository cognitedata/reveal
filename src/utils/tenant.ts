export function sanitizeTenant(tenant: string = '') {
  return tenant.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function getProject(path: string = '') {
  return sanitizeTenant(path.match(/^\/([^/]*)(.*)$/)?.[1]);
}
