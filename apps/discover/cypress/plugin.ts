import { readFileSync } from 'fs';

import express from 'express';

module.exports = (_, config) => {
  const port = process.env.PORT;
  const pathToBuild = './apps/discover/build_bazel';
  const html = readFileSync(`${pathToBuild}/index.html`);

  function redirectUnmatched(_, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  const app = express();
  app.use(express.static(pathToBuild));
  app.use(redirectUnmatched);

  app.listen(port);

  return {
    ...config,
    config: {
      baseUrl: `http://localhost:${port}`,
    },
    env: {
      BASE_URL: `http://localhost:${port}`,
    },
  };
};
