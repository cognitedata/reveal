// config here is ONLY for local dev
window.__cogniteSidecar = {
  // FakeIdp is used for e2e tests fake authentication
  fakeIdp: [
    {
      roles: [],
      groups: ['oidc-admin-group'],
      fakeApplicationId: 'user',
      // project to run e2e tests against
      project: 'simconfig-e2e',
      // to match `Login with Fake IDP (azure-dev)` button
      name: 'azure-dev',
      cluster: 'azure-dev',
      tokenId: 'token-1',
      userId: 'user-1',
    },
  ],
};
