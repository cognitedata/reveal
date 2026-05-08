/*!
 * Copyright 2022 Cognite AS
 */
const isMac = process.platform === 'darwin';

module.exports = {
  launch: {
    ignoreHTTPSErrors: true,
    // https://peter.sh/experiments/chromium-command-line-switches/
    // On Linux CI use SwiftShader for software WebGL; on Mac use headed mode since headless Chrome has no GPU access
    args: isMac
      ? ['--allow-insecure-localhost', '--window-size=800,600', '--no-sandbox']
      : ['--allow-insecure-localhost', '--window-size=800,600', '--no-sandbox', '--use-gl=swiftshader'],
    headless: !isMac,
    defaultViewport: {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1, // https://github.com/puppeteer/puppeteer/issues/571
      isMobile: false
    },
    dumpio: false // get console output
  }
};
