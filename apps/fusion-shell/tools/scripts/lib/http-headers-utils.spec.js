const { generateCSPHeader } = require('./http-headers-utils');

describe('HttpHeaders Utils', () => {
  const appsManifestJson = {
    apps: [
      {
        key: 'cdf-access-management',
        appName: '@cognite/cdf-access-management',
        appType: 'single-spa',
        hosting: {
          staging: 'https://cdf-access-management-staging.web.app',
          preview: 'https://cdf-access-management-preview.web.app',
          production: 'https://cdf-access-management-prod.web.app',
        },
      },
      {
        key: 'cdf-dashboard-sessions-ui',
        appName: '@cognite/cdf-dashboard-sessions-ui',
        appType: 'single-spa',
        versionSpec: '~0.2.6',
        routes: [{ route: '/:tenantName/dashboard-sessions' }],
      },
      {
        key: 'cdf-data-catalog',
        appName: '@cognite/cdf-data-catalog',
        appType: 'single-spa',
        hosting: {
          staging: 'https://cdf-data-catalog-staging.web.app',
          preview: 'https://cdf-data-catalog-preview.web.app',
          production: 'https://cdf-data-catalog-prod.web.app',
        },
      },
    ],
  };

  it('Should generate content-security-policy header', () => {
    expect(generateCSPHeader(appsManifestJson, 'staging')).toEqual(
      "default-src 'self' https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/ https://cdn.cogniteapp.com https://app.intercom.io https://widget.intercom.io https://js.intercomcdn.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; connect-src 'self' wss: blob: data: https: https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me/inter/inter.css https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; object-src 'none'; child-src blob: https://share.intercom.io https://intercom-sheets.com https://www.intercom-reporting.cm https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; font-src 'self' data: https://fonts.gstatic.com https://js.intercomcdn.com https://rsms.me https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; worker-src 'self' blob: https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; media-src 'self' https://js.intercomcdn.com https://*.cognitedata.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*; form-action https://intercom.help https://api-iam.intercom.io https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; img-src 'self' blob: data: https://*.cognitedata.com https://auth-dev.cognite.ai https://js.intercomcdn.com https://static.intercomassets.com https://downloads.intercomcdn.com https://uploads.intercomusercontent.com https://gifs.intercomcdn.com https://video-messages.intercomcdn.com https://messenger-apps.intercom.io https://*.intercom-attachments-5.com https://*.intercom-attachments-6.com https://*.intercom-attachments-9.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-staging.web.app https://cdf-data-catalog-staging.web.app localhost:* *.localhost:*; frame-src * 'self';"
    );

    expect(generateCSPHeader(appsManifestJson, 'production')).toEqual(
      "default-src 'self' https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/ https://cdn.cogniteapp.com https://app.intercom.io https://widget.intercom.io https://js.intercomcdn.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; connect-src 'self' wss: blob: data: https: https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me/inter/inter.css https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; object-src 'none'; child-src blob: https://share.intercom.io https://intercom-sheets.com https://www.intercom-reporting.cm https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; font-src 'self' data: https://fonts.gstatic.com https://js.intercomcdn.com https://rsms.me https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; worker-src 'self' blob: https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; media-src 'self' https://js.intercomcdn.com https://*.cognitedata.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*; form-action https://intercom.help https://api-iam.intercom.io https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; img-src 'self' blob: data: https://*.cognitedata.com https://auth-dev.cognite.ai https://js.intercomcdn.com https://static.intercomassets.com https://downloads.intercomcdn.com https://uploads.intercomusercontent.com https://gifs.intercomcdn.com https://video-messages.intercomcdn.com https://messenger-apps.intercom.io https://*.intercom-attachments-5.com https://*.intercom-attachments-6.com https://*.intercom-attachments-9.com https://*.preview.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdf-access-management-prod.web.app https://cdf-data-catalog-prod.web.app; frame-src * 'self';"
    );
  });
});
