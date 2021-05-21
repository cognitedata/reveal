## 1.2.3 May 21 2021

- Bump tsa to v1.2.4

## 1.2.2 May 20 2021

- Bump tsa to v1.2.3

## 1.2.0 May 19 2021

- Removed unused hook useLoginToCdf
- Changed from static variable to useMemo for CogniteClient (to support hot reloading)

## 1.1.2 May 18 2021

- Bump tsa

## 1.1.1 May 18 2021

- Bump auth to get better FAKE_IDP support

## 1.1.0 May 15 2021

- Change way i18n is loaded, removes all existing errors
  - sidecar props are now different

## 1.0.4 May 11 2021

- Bump auth

## 1.0.3 May 11 2021

- Fix intercom loading issue

## 1.0.2 May 10 2021

- Bump i18n

## 1.0.1 May 5 2021

### Changes

- Bump auth

## 1.0.0 May 5 2021

### Changes

- Upgrade to SDK v4 (via auth-utils)

## 0.13.1 May 3 2021

### Changes

- Fix bug using wrong token for E2E mode

## 0.13.0 May 1 2021

### Changes

- Bump TSA to new version that has the 'Choose Azure tenant' option

## 0.12.0 April 27 2021

### Changes

- Breaking: require process.env.REACT_APP_E2E_MODE before using auth from local env vars
- Feat: add process.env.REACT_APP_ID_TOKEN and process.env.REACT_APP_ACCESS_TOKEN usage

## 0.11.4 April 21 2021

### Changes

- BUG: sentry container enable flag was configured wrong
- BUG: loop detector container enable flag was configured wrong

## 0.11.3 Mar 25 2021

### Changes

- Bump `react-i18n` from `0.3.0` to `0.3.1`
- Bump `react-tenant-selector` from `0.6.8` to `0.6.9`

## 0.11.1 Mar 24 2021

### Changes

- Move `react-router-dom` from `dependencies` to `devDependencies` and `peerDependencies`

## 0.11.0 Mar 16 2021

### Changes

- Breaking, change props for `getAuthHeaders` from `apiKeyHeader?: string` to object form `{apiKeyHeader?: string}`
- Add `useIdToken` props to `getAuthHeaders` to get the headers setup for sending the ID token instead of the auth token

## 0.10.0 Mar 9 2021

### Changes

- Add default Sentry wrapper, use disableSentry to disable

## 0.9.3 Mar 8 2021

### Changes

- Add default loopDetector, use disableLoopDetector to disable
- Add new component `ConditionalWrapperWithProps` to allow to pass props to ConditionalWrapper

## 0.9.0 Feb 23 2021

### Changes

- Make sidecar a prop
- Bump auth-utils to 0.8.0
- Add display of AD error message

## 0.8.0 Feb 19 2021

### Changes

- Removed CdfAuthContainer -> now use just Container and AuthContainer/AuthProvider
- Removed getSDKClient -> use the client from AuthContainer/AuthProvider
- Fixed container not passing cdfApiBaseUrl to CogniteClient correctly

## 0.7.3 Feb 18 2021

### Changes

- Bump tenant-selector-component

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
