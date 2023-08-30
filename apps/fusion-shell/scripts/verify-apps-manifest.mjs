import appsManifest from '../src/apps-manifest.json' assert { type: 'json' };

async function verifyValidSingleSpaUrls(appsManifest) {
  for (const app of appsManifest.apps) {
    if (!app.hosting) {
      continue;
    }
    for (const env of ['staging', 'preview', 'production']) {
      const baseUrl = app.hosting[env];
      const res = await fetch(`${baseUrl}/index.js`);
      if (!res.ok) {
        console.error(`Failed to fetch for ${env} for ${app.key}`);
      }
    }
  }
}

verifyValidSingleSpaUrls(appsManifest);
