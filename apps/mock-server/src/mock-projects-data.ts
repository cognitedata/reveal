export const projectsMockData = {
  name: 'platypus',
  id: 'platypus',
  externalId: 'platypus',
  urlName: 'platypus',
  oidcConfiguration: {
    jwksUrl: 'https://login.windows.net/common/discovery/keys',
    issuer: 'https://sts.windows.net/267cfdd8-a207-4320-80f2-a4352b15048f/',
    audience: 'https://greenfield.cognitedata.com',
    accessClaims: [
      {
        claimName: 'groups',
      },
      {
        claimName: 'roles',
      },
      {
        claimName: 'appid',
      },
      {
        claimName: 'https://cognitedata.com/roles',
      },
      {
        claimName: 'sub',
      },
    ],
    scopeClaims: [
      {
        claimName: 'scp',
      },
      {
        claimName: 'scope',
      },
    ],
    logClaims: [
      {
        claimName: 'scope',
      },
      {
        claimName: 'aud',
      },
      {
        claimName: 'groups',
      },
      {
        claimName: 'sub',
      },
      {
        claimName: 'roles',
      },
      {
        claimName: 'scp',
      },
      {
        claimName: 'appid',
      },
      {
        claimName: 'https://cognitedata.com/roles',
      },
    ],
    tokenUrl:
      'https://login.windows.net/267cfdd8-a207-4320-80f2-a4352b15048f/oauth2/token',
    skewMs: 0,
    identityProviderScope: null,
    isGroupCallbackEnabled: true,
  },
  userProfilesConfiguration: {
    enabled: true,
  },
};
