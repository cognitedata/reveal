/* eslint-disable no-underscore-dangle */
// config here is ONLY for local dev
window.__cogniteSidecar = {
  // FakeIdp is used for e2e tests fake authentication
  fakeIdp: [
    {
      roles: [],
      groups: ['defaultGroup'],
      fakeApplicationId: '7cda2c70-4c73-4eae-88e5-634d64c33da5',
      // project to run e2e tests against
      project: 'power-ops-dev',
      // to match `Login with Fake IDP (azure-dev)` button
      name: 'power-ops-dev',
      cluster: 'azure-dev',
      tokenId: 'power-ops-dev',
      userId: 'power-ops-dev-azure-dev',
      otherIdTokenFields: {
        given_name: 'E2E',
        family_name: 'System User',
      },
    },
    {
      roles: [],
      groups: ['defaultGroup'],
      fakeApplicationId: '7cda2c70-4c73-4eae-88e5-634d64c33da5',
      // project to run e2e tests against
      project: 'power-ops-e2e',
      // to match `Login with Fake IDP (azure-dev)` button
      name: 'power-ops-e2e',
      cluster: 'azure-dev',
      tokenId: 'power-ops-e2e',
      userId: 'power-ops-e2e-azure-dev',
      otherIdTokenFields: {
        given_name: 'E2E',
        family_name: 'System User',
      },
    },
  ],
  disableIntercom: false,
};
