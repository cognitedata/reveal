const { setFailed, setOutput, getInput, info } = require('@actions/core');

const run = async () => {
  try {
    const site = getInput('firebaseSite');
    info(`site: ${site}`);

    const content = `{
      "hosting": [
        {
          "site": "${site}",
          "public": ".",
          "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
          "rewrites": [
            {
              "source": "/**",
              "destination": "/index.html"
            }
          ],
          "headers": [
            {
              "source": "/**",
              "headers": [
                {
                  "key": "Content-Security-Policy",
                  "value": "report-uri https://o124058.ingest.sentry.io/api/6250679/security/?sentry_key=b3b2d92e10d3468f987a24bc6b593d60; script-src https://fast.appcues.com 'self' https://localhost:* https://*.cogniteapp.com https://*.firebaseio.com https://*.google.com https://*.googleapis.com https://*.hotjar.com https://cognitedata.atlassian.net https://*.mixpanel.com https://cdn.segment.com https://*.sentry.io https://sentry.io 'unsafe-eval' https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/; frame-ancestors 'self' https://localhost:* https://*.cognite.com https://*.cogniteapp.com https://*.cognitedata.com https://*.locize.app https://locize.app; object-src 'none'; worker-src 'self' blob: https://localhost:* https://*.cogniteapp.com"
                }
              ]
            },
            {
              "source": "**",
              "headers": [
                {
                  "key": "Access-Control-Allow-Origin",
                  "value": "*"
                }
              ]
            },
            {
              "source": "/index.js",
              "headers": [
                {
                  "key": "Cache-Control",
                  "value": "max-age=0, no-cache, no-store, must-revalidate"
                }
              ]
            },
            {
              "source": "/remoteEntry.js",
              "headers": [
                {
                  "key": "Cache-Control",
                  "value": "max-age=0, no-cache, no-store, must-revalidate"
                }
              ]
            }
          ]
        }
      ]
    }`;

    info(`content: ${content}`);
    setOutput('content', content);
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed('Unknown error occured.');
    }
  }
};

run();
