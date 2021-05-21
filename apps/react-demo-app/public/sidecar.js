// config here is ONLY for local dev
window.__cogniteSidecar = {
  fakeIdp: [
    {
      roles: [],
      groups: ['defaultGroup'],
      fakeApplicationId: 'user',
      project: 'react-demo-app-e2e-azure-dev',
      cluster: 'azure-dev',
    },
    {
      roles: ['administer'],
      groups: ['defaultGroup'],
      fakeApplicationId: 'admin',
      project: 'react-demo-app-e2e-azure-dev',
      cluster: 'azure-dev',
    },
  ],
};
