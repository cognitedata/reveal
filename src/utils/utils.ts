import { styleScope } from './styleScope';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

/**
 * Get release version
 * @param version SemVer details
 * @returns {string} Core version or just version if unprocessable
 */
export const getReleaseVersionCore = (version?: string): string => {
  if (version === undefined) {
    return '';
  }
  const parsedVersion = parseReleaseVersion(version);
  return parsedVersion.length > 0 ? parsedVersion[0] : version;
};

/**
 * Get version state
 * @param version SemVer details
 * @returns {string|undefined} State of release i.e. prerelease or beta
 */
export const getReleaseState = (version?: string): string | undefined => {
  if (version === undefined) {
    return '';
  }
  const matches = parseReleaseVersion(version);
  if (typeof matches[1] === 'string') {
    if (/(?:release|beta|alpha)/.test(matches[1].toLowerCase())) {
      return 'Prerelease';
    }
  }
  return undefined;
};

/**
 * Get build version of release
 * @param version SemVer details
 * @returns {string|undefined} Build of release
 */
export const getReleaseBuild = (version?: string): string | undefined => {
  if (version === undefined) {
    return '';
  }
  const parsedVersion = parseReleaseVersion(version);
  return parsedVersion !== null && parsedVersion.length > 2
    ? parsedVersion[2]
    : undefined;
};

const parseReleaseVersion = (version: string): string[] => {
  /** @see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string */
  const versionCoreExp = /((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))/;
  const stateExp =
    /(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?/;
  const buildExp = /(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/;

  const matches = version.match(
    new RegExp(`^${versionCoreExp.source}${stateExp.source}${buildExp.source}$`)
  );
  return [version].concat((matches || []).slice(2, 4));
};
