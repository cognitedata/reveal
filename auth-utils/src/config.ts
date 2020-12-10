export default {
  cluster: process.env.REACT_APP_CLUSTER,
  oidc: {
    clientId: process.env.REACT_APP_OIDC_CLIENT_ID,
    authority: process.env.REACT_APP_OIDC_AUTHORITY,
    scope: process.env.REACT_APP_OIDC_SCOPE,
  },
};
