import fs from 'fs';
import { rm } from 'fs/promises';

import express from 'express';

module.exports = (on, config) => {
  const port = process.env.PORT;
  const pathToBuild = './apps/react-demo-app/build_bazel';
  const html = fs.readFileSync(`${pathToBuild}/index.html`);

  function redirectUnmatched(_, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  const app = express();
  app.use(express.static(pathToBuild));
  app.use(redirectUnmatched);

  app.listen(port);

  const filesToDelete = [];
  on('after:spec', (spec, results) => {
    if (results.stats.failures === 0 && results.video) {
      filesToDelete.push(results.video);
    }
  });
  on('after:run', async () => {
    await Promise.all(filesToDelete.map((videoFile) => rm(videoFile)));
  });

  return {
    ...config,
    baseUrl: `http://localhost:${port}`,
    env: {
      BASE_URL: `http://localhost:${port}`,
    },
  };
};
