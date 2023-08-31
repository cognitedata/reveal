import { AppManifest, Environment } from '../src/appManifests';

type CSPHeaderGroups = Record<string, string[]>;

function appendHeader(cspHeaderGroups: CSPHeaderGroups, url: string) {
  cspHeaderGroups['default-src'].push(url);
  cspHeaderGroups['script-src'].push(url);
  cspHeaderGroups['connect-src'].push(url);
  cspHeaderGroups['style-src'].push(url);
  cspHeaderGroups['child-src'].push(url);
  cspHeaderGroups['font-src'].push(url);
  cspHeaderGroups['worker-src'].push(url);
  cspHeaderGroups['form-action'].push(url);
  cspHeaderGroups['img-src'].push(url);
}

export function generateCSPHeader(appManifests: AppManifest[]) {
  const cspHeaderGroups: CSPHeaderGroups = {
    'default-src': [
      "'self' https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*",
    ],
    'script-src': [
      "'self' 'unsafe-eval' 'unsafe-inline' https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/ https://cdn.cogniteapp.com https://app.intercom.io https://widget.intercom.io https://js.intercomcdn.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/",
    ],
    'connect-src': [
      "'self' wss: blob: data: https: https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*",
    ],
    'style-src': [
      "'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me/inter/inter.css https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/",
    ],
    'object-src': ["'none'"],
    'child-src': [
      'blob: https://share.intercom.io https://intercom-sheets.com https://www.intercom-reporting.cm https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*',
    ],
    'font-src': [
      "'self' data: https://fonts.gstatic.com https://js.intercomcdn.com https://rsms.me https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/",
    ],
    'worker-src': [
      "'self' blob: https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*",
    ],
    'media-src': [
      "'self' https://js.intercomcdn.com https://*.cognitedata.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*",
    ],
    'form-action': [
      'https://intercom.help https://api-iam.intercom.io https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*',
    ],
    'img-src': [
      "'self' blob: data: https://*.cognitedata.com https://auth-dev.cognite.ai https://js.intercomcdn.com https://static.intercomassets.com https://downloads.intercomcdn.com https://uploads.intercomusercontent.com https://gifs.intercomcdn.com https://video-messages.intercomcdn.com https://messenger-apps.intercom.io https://*.intercom-attachments-5.com https://*.intercom-attachments-6.com https://*.intercom-attachments-9.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://apps-cdn.cogniteapp.com",
    ],
    'frame-src': ["* 'self'"],
  };

  appManifests
    .map((app) => app.hosting)
    .forEach((hosting) => {
      const envs: Environment[] = ['staging', 'preview', 'production'];
      for (const env of envs) {
        // we can ignore when the hosting is pointing to the same domain (we serve the file)
        if (hosting[env].startsWith('/')) continue;
        appendHeader(cspHeaderGroups, hosting[env]);
      }
    });
  appendHeader(cspHeaderGroups, 'localhost:* *.localhost:*');

  return Object.keys(cspHeaderGroups)
    .reduce((acc, key) => {
      const value = cspHeaderGroups[key].join(' ');
      return `${acc}${key} ${value}; `;
    }, '')
    .trim();
}
