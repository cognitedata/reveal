import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { updateApis, updateApiVersions } from './api.js';

dotenv.config({ path: `.env.local` });

const fetchAccessToken = async () => {
  const url = new URL(
    `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`
  );

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.CLIENT_ID);
  params.append('client_secret', process.env.CLIENT_SECRET);
  params.append('scope', process.env.SCOPE);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
    .then((x) => {
      return x.json();
    })
    .then((json) => json.access_token)
    .catch(console.error);
};

const main = async () => {
  const manifestPath = path.resolve('resources/schema/manifest.json');
  const token = await fetchAccessToken();

  const manifest = JSON.parse(fs.readFileSync(manifestPath).toString('utf-8'));
  console.log(JSON.stringify(await updateApis([manifest.api], token)));

  const apiVersions = manifest.api.versions.map((apiVersion) => {
    const apiVersionPath = path.resolve(
      `resources/schema/${apiVersion.source}`
    );
    return {
      version: apiVersion.version,
      apiExternalId: manifest.api.externalId,
      graphQl: fs.readFileSync(apiVersionPath).toString('utf-8'),
      bindings: apiVersion.bindings,
    };
  });

  console.log(JSON.stringify(await updateApiVersions(apiVersions, token)));
};

main();
