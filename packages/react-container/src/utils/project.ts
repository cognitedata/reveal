import { KEY_LAST_PROJECT, storage } from './localStorage';

/**
 * Parse tenancy information from the URL -- the entire URL (host & path) if
 * necessary.
 *
 * @param {any} location {@code window.location}
 * @return {string} the project name, or {@code ''} if one is not present
 */
export const getProject = (
  { pathname }: Location = window.location
): string => {
  if (!pathname) {
    return '';
  }

  // split strings on 'something/'
  const match = pathname.match(/^\/([a-z0-9-]+)\/?/i);

  if (!match) {
    return '';
  }

  return match[1];
};

// -TODO: add check: according to CDF the project string is between 3 and 32 characters
export const sanitizeProject = (project: string): string =>
  (project || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

export const getLastProject = (): string =>
  storage.getRootString<string, string>(KEY_LAST_PROJECT, '') || '';

export const setLastProject = (project: string) =>
  storage.setRootItem(KEY_LAST_PROJECT, project);

export const getProjectInfo = (location?: Location) => {
  const possibleProject = getProject(location);
  const sanitizedProject = sanitizeProject(possibleProject);

  return [possibleProject, sanitizedProject, getLastProject()];
};
