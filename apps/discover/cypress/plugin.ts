import { readFileSync } from 'fs';

import express from 'express';
import { v1 as uuid } from 'uuid';

module.exports = (_, config) => {
  const port = process.env.PORT;
  const pathToBuild = './apps/discover/build_bazel';
  const html = readFileSync(`${pathToBuild}/index.html`);

  function redirectUnmatched(_, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
  const uniqueId = uuid();
  const app = express();
  app.get('/uuid', (req, res) => {
    res.json(uniqueId);
  });
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
      REACT_APP_E2E_USER: uniqueId,
    },
  };
};
