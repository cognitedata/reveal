import { AppManifest } from '../src/appManifests';

import { generateCSPHeader } from './http-headers-utils';

describe('HttpHeaders Utils', () => {
  const appManifests: AppManifest[] = [
    {
      key: 'cdf-access-management',
      appName: '@cognite/cdf-access-management',
      hosting: {
        staging: 'https://cdf-access-management-staging.web.app',
        preview: 'https://cdf-access-management-preview.web.app',
        production: 'https://cdf-access-management-prod.web.app',
      },
      routes: [],
    },
    {
      key: 'cdf-datastudio',
      appName: '@cognite/cdf-datastudio',
      hosting: {
        staging:
          '/dependencies/@cognite/datastudio/1.2.0/8fba1f60c54f66ef38a809b19fc86364.js',
        preview:
          '/dependencies/@cognite/datastudio/1.2.0/8fba1f60c54f66ef38a809b19fc86364.js',
        production:
          '/dependencies/@cognite/datastudio/1.2.0/8fba1f60c54f66ef38a809b19fc86364.js',
      },
      routes: [],
    },
  ];

  it('Should generate content-security-policy header', () => {
    expect(generateCSPHeader(appManifests)).toMatchInlineSnapshot(
      `"default-src 'self' https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/ https://cdn.cogniteapp.com https://app.intercom.io https://widget.intercom.io https://js.intercomcdn.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/ https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; connect-src 'self' wss: blob: data: https: https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me/inter/inter.css https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/ https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; object-src 'none'; child-src blob: https://share.intercom.io https://intercom-sheets.com https://www.intercom-reporting.cm https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; font-src 'self' data: https://fonts.gstatic.com https://js.intercomcdn.com https://rsms.me https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/ https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; worker-src 'self' blob: https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; media-src 'self' https://js.intercomcdn.com https://*.cognitedata.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*; form-action https://intercom.help https://api-iam.intercom.io https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; img-src 'self' blob: data: https://*.cognitedata.com https://auth-dev.cognite.ai https://js.intercomcdn.com https://static.intercomassets.com https://downloads.intercomcdn.com https://uploads.intercomusercontent.com https://gifs.intercomcdn.com https://video-messages.intercomcdn.com https://messenger-apps.intercom.io https://*.intercom-attachments-5.com https://*.intercom-attachments-6.com https://*.intercom-attachments-9.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://apps-cdn.cogniteapp.com https://cdf-access-management-staging.web.app https://cdf-access-management-preview.web.app https://cdf-access-management-prod.web.app localhost:* *.localhost:*; frame-src * 'self';"`
    );
  });
});
