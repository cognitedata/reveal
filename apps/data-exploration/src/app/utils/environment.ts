const checkUrl = (env: string) => window.location.hostname.includes(env);

export const isDevelopment = () => checkUrl('dev') || checkUrl('localhost');
export const isStaging = () =>
  checkUrl('staging') || checkUrl('next-release') || checkUrl('pr');
export const isProduction = () => !(isStaging() || isDevelopment());

export const getEnvironment = () => {
  if (isDevelopment()) return 'development';
  if (isStaging()) return 'staging';
  return 'production';
};
