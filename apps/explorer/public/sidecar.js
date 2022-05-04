/* eslint-disable no-underscore-dangle */
// config here is ONLY for local dev
window.__cogniteSidecar = {
  // FakeIdp is used for e2e tests fake authentication
  fakeIdp: [
    {
      roles: [],
      groups: ['readGroup'],
      fakeApplicationId: '5a262178-942b-4c8f-ac15-f96642b73b56',
      // project to run e2e tests against
      project: 'react-demo-app-e2e-azure-dev',
      // to match `Login with Fake IDP (azure-dev)` button
      name: 'azure-dev',
      cluster: 'azure-dev',
      tokenId: 'react-demo-e2e',
      userId: 'react-demo-app-e2e-azure-dev',
      otherIdTokenFields: {
        given_name: 'Normal',
        family_name: 'User',
      },
    },
  ],
  disableIntercom: true,
  disableLegacyLogin: true,
};
