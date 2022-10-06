/*!
 * Copyright 2022 Cognite AS
 */
module.exports = {
  launch: {
    ignoreHTTPSErrors: true,
    // https://peter.sh/experiments/chromium-command-line-switches/
    args: ['--allow-insecure-localhost', '--window-size=800,600', '--no-sandbox', '--use-gl=swiftshader'],
    headless: true,
    defaultViewport: {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1, // https://github.com/puppeteer/puppeteer/issues/571
      isMobile: false
    },
    dumpio: false // get console output
  }
};
