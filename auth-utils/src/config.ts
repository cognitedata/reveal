export default {
  cluster: process.env.CLUSTER,
  oidc: {
    clientId: process.env.OIDC_CLIENT_ID,
    authority: process.env.OIDC_AUTHORITY,
    scope: process.env.OIDC_SCOPE,
  },
};
