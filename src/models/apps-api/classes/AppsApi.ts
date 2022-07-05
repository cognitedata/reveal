import { isProduction } from 'models/charts/config/utils/environment';

export default class AppsApi {
  static baseUrl(cogniteApiHost: string) {
    const stagingPart = isProduction ? '' : 'staging';
    const cluster = cogniteApiHost.replace('.cognitedata.com', '');
    const finalCluster = cluster === 'api' ? null : cluster;
    const url = ['apps-api', stagingPart, finalCluster, 'cognite', 'ai']
      .filter(Boolean)
      .join('.');
    return `https://${url}`;
  }

  static fetchFirebaseToken(
    appsApiUrl: string,
    project: string,
    firebaseAppName: string,
    accessToken: string
  ) {
    return fetch(
      `${appsApiUrl}/${project}/login/firebase?${new URLSearchParams({
        tenant: project,
        app: firebaseAppName,
        json: 'true',
      }).toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
      .then((r) => r.json())
      .then(({ firebaseToken }: { firebaseToken: string }) => {
        return firebaseToken;
      });
  }

  static fetchFirebaseEnvironment(
    appsApiUrl: string,
    project: string,
    firebaseAppName: string,
    accessToken: string
  ) {
    return fetch(
      `${appsApiUrl}/env?${new URLSearchParams({
        tenant: project,
        app: firebaseAppName,
        version: '0.0.0',
      }).toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
      .then((r) => r.json())
      .then(
        (result: {
          tenant: string;
          config: {
            cognite: {
              project: string;
              baseUrl?: string;
            };
            firebase: {
              databaseURL: string;
            };
          };
        }) => result.config
      );
  }
}
