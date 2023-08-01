export const logMetadata = () => {
  const {
    REACT_APP_APP_ID: appId = 'appId: n/a',
    REACT_APP_VERSION_NAME: versionName = 'ver: n/a',
    REACT_APP_VERSION_SHA: versionSha = '0',
    REACT_APP_ENV: env = 'env: n/a',
  } = process.env;
  const baseStyle = `display:inline-block;font:12px/1 sans-serif;background:#555;color:white;padding:5px 10px;margin:5px 5px 5px 0;border-radius:50px;`;
  // eslint-disable-next-line no-console
  console.debug(
    `%c${env}%c${appId}%c${versionName}-${versionSha.slice(0, 6)}`,
    `${baseStyle};font-weight:bold;${
      env === 'production' ? 'background:#c20' : 'background:#46a'
    }`,
    baseStyle,
    `${baseStyle};font-family:monospace`
  );
};
