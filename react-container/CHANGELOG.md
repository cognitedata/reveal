## 0.7.2 Feb 16 2021

### Changes

- Add prop aadApplicationId to allow for local TSA
- Fix bug with auth token name change

## 0.7.1 Feb 12 2021

### Changes

- update deps for TSC+i18n

## 0.7.0 Feb 10 2021

### Changes

- get applicationId from sidecar not props
- Updated to use auth-utils@0.5.0
- add a note saying `retrieveAuthResult` was broken since 0.5.0

## 0.6.0 Jan 22 2021

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
