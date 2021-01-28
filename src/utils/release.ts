export const getFASVersionName = (): string =>
  process.env.REACT_APP_VERSION_NAME || 'dev';

export const getReleaseDate = (): string => {
  const releaseDate = process.env.REACT_APP_RELEASE_DATE
    ? new Date(Number(process.env.REACT_APP_RELEASE_DATE))
    : new Date();
  return releaseDate.toISOString().split('T')[0];
};

export const getReleaseVersion = () => {
  let version = getFASVersionName();
  // remove prerelease from the production version
  if (process.env.REACT_APP_ENV === 'production') {
    [version] = version.split('-');
  }
  const releaseDate = getReleaseDate();
  return `${version} ${releaseDate}`;
};
