/**
 * We check what Fusion environment it is by extracting what we suppose to be env
 * directly from the URL. We can't just check if the string representing env
 * is in the hostname because some org named include "dev" or "prod" string.
 *
 * Examples:
 *
 * dev.fusion.cogniteapp.com - dev - will return true for "dev"
 * fusion.cognite.com - prod - will return true for "prod"
 * next-release.fusion.cognite.com - next-release - will return true for "next-release"
 * devex.dev.fusion.cogniteapp.com - dev - will return true for "dev"
 * devex.fusion.cognite.com - prod - will return true for "prod"
 * devex.next-release.fusion.cognite.com - next-release - will return true for "next-release"
 */
export const checkUrl = (env: Envs) => {
  const { hostname } = window.location;
  // Disabling this eslint rule because Regex actually DOES need that escape
  // eslint-disable-next-line no-useless-escape
  const regex = /([^\.\s]*?)(?=.fusion)/gi;
  const hostnameEnvMatch = hostname.match(regex);
  const hostnameEnv = hostnameEnvMatch?.[0];
  if (env === 'prod') {
    /**
     * Production environment will return:
     * - null - if there's no org name in URL
     * - org name - if there is org name
     * To detect if env is production, we just check if hostname env is null or some
     * other string than other env names.
     */
    const nonProdEnvs = Object.keys(Envs).filter((e) => e !== Envs.PROD);
    return !hostnameEnv || !nonProdEnvs.includes(hostnameEnv);
  }
  return hostnameEnv === env;
};

export enum Envs {
  PROD = 'prod',
  DEV = 'dev',
  LOCALHOST = 'localhost',
  STAGING = 'staging',
  NEXT_RELEASE = 'next-release',
  PR = 'pr',
}
