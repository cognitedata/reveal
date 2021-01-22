## 0.6.0 Jan 22 2020

### Changes

- Make logs a bit safer and better
- Use new authResult from `auth-utils`
- Use new way of setup for CogniteAuth

## 0.4.0 Dec 23 2020

### Changes

- Add AuthContainer

## 0.3.0 Nov 23 2020

### Changes

- Starting to test new auth container, this adds some new stuff, like:
  - CdfAuthContainer
  - useLoginToCdf
  - getCogniteSDKClient

## 0.2.0 Nov 23 2020

### Breaking changes:

- added `getAuthHeaders` instead of `getLoginToken` for auth

### Changes:

- exposed `retrieveAccessToken` so you can still get token directly
- added `isLocalhost`
