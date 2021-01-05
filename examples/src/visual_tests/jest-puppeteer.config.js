module.exports = {
  launch: {
    ignoreHTTPSErrors: true,
    // https://peter.sh/experiments/chromium-command-line-switches/
    args: ['--allow-insecure-localhost', '--window-size=800,600', '--no-sandbox'],
    headless: true,
    defaultViewport: {
      width: 800,
      height: 600,
      deviceScaleFactor: 2, // https://github.com/puppeteer/puppeteer/issues/571
      isMobile: false
    },
    dumpio: false, // get console output
  },
};
