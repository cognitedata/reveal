/* eslint-disable no-underscore-dangle */
// config here is ONLY for local dev
window.__cogniteSidecar = {
  // FakeIdp is used for e2e tests fake authentication
  fakeIdp: [
    {
      roles: [],
      groups: ['defaultGroup'],
      fakeApplicationId: '5a262178-942b-4c8f-ac15-f96642b73b56',
      // project to run e2e tests against
      project: 'scarlet-e2e-azure-dev',
      // to match `Login with Fake IDP (azure-dev)` button
      name: 'azure-dev',
      cluster: 'azure-dev',
      tokenId: 'react-demo-e2e',
      userId: 'scarlet-e2e-azure-dev',
      otherIdTokenFields: {
        given_name: 'Normal',
        family_name: 'User',
      },
    },
    {
      roles: [],
      groups: ['defaultGroup'],
      fakeApplicationId: '245a8a64-4142-4226-86fa-63d590de14c9',
      // project to run e2e tests against
      project: 'scarlet-e2e-bluefield',
      // to match `Login with Fake IDP (bluefield)` button
      name: 'bluefield',
      cluster: 'bluefield',
      tokenId: 'react-demo-e2e',
      userId: 'scarlet-e2e-azure-dev',
    },
  ],
  disableIntercom: false,
};
