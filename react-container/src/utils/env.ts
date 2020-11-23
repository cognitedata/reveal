// REACT_APP_ENV variable is set through cognite-release-manager
const ENV = process.env.REACT_APP_ENV || process.env.NODE_ENV;

const safeHostname = (hostname?: string) =>
  hostname || window.location.hostname || '';

const isEnvironment = (environement: string) => ENV === environement;

export const isDevelopment = isEnvironment('development');

export const isTest = isEnvironment('test');

export const isProduction = isEnvironment('production');

export const isStaging = (hostname?: string) =>
  safeHostname(hostname).includes('staging.') || ENV === 'staging';

export const isLocalhost = (hostname?: string) =>
  safeHostname(hostname).includes('localhost');

export const isStagingOrLocalhost = (hostname?: string) => {
  return isLocalhost(hostname) || isStaging(hostname);
};
