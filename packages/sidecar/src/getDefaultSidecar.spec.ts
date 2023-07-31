import { getDefaultSidecar } from './getDefaultSidecar';

describe('getDefaultSidecar', () => {
  it('works for ew1', () => {
    expect(getDefaultSidecar({ prod: true, cluster: 'ew1' })).toMatchObject({
      appsApiBaseUrl: 'https://apps-api.cognite.ai',
      cdfApiBaseUrl: 'https://api.cognitedata.com',
      cdfCluster: '',
      commentServiceBaseUrl: 'https://comment-service.cognite.ai',
      digitalCockpitApiBaseUrl: 'https://digital-cockpit-api.cognite.ai',
      discoverApiBaseUrl: 'https://discover-api.cognite.ai',
      simconfigApiBaseUrl: 'https://simconfig-api.cognite.ai',
      userManagementServiceBaseUrl:
        'https://user-management-service.cognite.ai',
    });
  });

  it('works for ew1 + staging', () => {
    expect(getDefaultSidecar({ prod: false, cluster: 'ew1' })).toMatchObject({
      appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
      cdfApiBaseUrl: 'https://api.cognitedata.com',
      cdfCluster: '',
      commentServiceBaseUrl: 'https://comment-service.staging.cognite.ai',
      digitalCockpitApiBaseUrl:
        'https://digital-cockpit-api.staging.cognite.ai',
      discoverApiBaseUrl: 'https://discover-api.staging.cognite.ai',
      simconfigApiBaseUrl: 'https://simconfig-api.staging.cognite.ai',

      userManagementServiceBaseUrl:
        'https://user-management-service.staging.cognite.ai',
    });
  });

  it('works for bluefield', () => {
    expect(
      getDefaultSidecar({ prod: true, cluster: 'bluefield' })
    ).toMatchObject({
      appsApiBaseUrl: 'https://apps-api.bluefield.cognite.ai',
      cdfApiBaseUrl: 'https://bluefield.cognitedata.com',
      cdfCluster: 'bluefield',
      commentServiceBaseUrl: 'https://comment-service.bluefield.cognite.ai',
      digitalCockpitApiBaseUrl:
        'https://digital-cockpit-api.bluefield.cognite.ai',
      discoverApiBaseUrl: 'https://discover-api.bluefield.cognite.ai',
      simconfigApiBaseUrl: 'https://simconfig-api.bluefield.cognite.ai',

      userManagementServiceBaseUrl:
        'https://user-management-service.bluefield.cognite.ai',
    });
  });

  it('works for bluefield staging', () => {
    expect(
      getDefaultSidecar({ prod: false, cluster: 'bluefield' })
    ).toMatchObject({
      appsApiBaseUrl: 'https://apps-api.staging.bluefield.cognite.ai',
      cdfApiBaseUrl: 'https://bluefield.cognitedata.com',
      cdfCluster: 'bluefield',
      commentServiceBaseUrl:
        'https://comment-service.staging.bluefield.cognite.ai',
      digitalCockpitApiBaseUrl:
        'https://digital-cockpit-api.staging.bluefield.cognite.ai',
      discoverApiBaseUrl: 'https://discover-api.staging.bluefield.cognite.ai',
      simconfigApiBaseUrl: 'https://simconfig-api.staging.bluefield.cognite.ai',

      userManagementServiceBaseUrl:
        'https://user-management-service.staging.bluefield.cognite.ai',
    });
  });

  it('works for bluefield with localComments', () => {
    expect(
      getDefaultSidecar({
        prod: false,
        cluster: 'bluefield',
        localServices: ['comment-service'],
      })
    ).toMatchObject({
      appsApiBaseUrl: 'https://apps-api.staging.bluefield.cognite.ai',
      cdfApiBaseUrl: 'https://bluefield.cognitedata.com',
      cdfCluster: 'bluefield',
      commentServiceBaseUrl: 'http://localhost:8300',
      digitalCockpitApiBaseUrl:
        'https://digital-cockpit-api.staging.bluefield.cognite.ai',
      discoverApiBaseUrl: 'https://discover-api.staging.bluefield.cognite.ai',
      simconfigApiBaseUrl: 'https://simconfig-api.staging.bluefield.cognite.ai',
      userManagementServiceBaseUrl:
        'https://user-management-service.staging.bluefield.cognite.ai',
    });
  });
});
