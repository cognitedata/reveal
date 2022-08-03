## 6.0.5 July 28 2022

- always use sidecar.cdfCluster as the initial one

## 6.0.4 July 19 2022

- Fix the error message in token factory.

## 6.0.3 July 8 2022

- Bump cognite SDK to 7.1.1 to fix bug with react-container calling services with "Bearer Bearer X" access token

## 6.0.2 June 24 2022

- react-project-selector version bump

> Fix users redirected to OIDC when trying to use legacy login in some situations.

## 6.0.1 June 24 2022

- Move refreshPage declaration up to fix an issue when redirecting back after a login error

## 6.0.0-rc-1 May 25 2022

- moving mixpanel and frontend metrics inside the provider, to initialize add a prop called `getMixpanelSettings` with a function that returns `mixpanelProps`.

note: this is only a naming change, functionality is not affected

## 5.0.6 May 20 2022

- deprecate `getTenantInfo` in favor of `getProjectInfo`

note: this is only a naming change, functionality is not affected

## 5.0.5 May 16 2022

- react-project-selector version bump

> make browsers autofill work for the tenant id input, by adding input `name` attribute

## 5.0.4 May 13 2022

- react-project-selector version bump

> make browsers autofill work for the project name input, by adding input `name` attribute

## 5.0.2 May 2 2022

- Removed -rc from version

## 5.0.2-rc-1 Mar 22 2022

- Update package dependencies. No dependency on `@cognite/react-tenant-selector` anymore.

## 5.0.1-rc-1 Mar 21 2022

- Added 'uat' as allowed subdomain

## 5.0.0-rc-1 Feb 28 2022

- BREAKING: Use @cognite/sdk V7 client
- BREAKING: API key auth method support is dropped. `REACT_APP_API_KEY` has no effect anymore
- Updated authentication logic to use new SDK standards
- Refactored re-auth option to trigger from outside

## 4.0.7 Feb 25 2022

- Bump to update auth-utils version@2.2.3 which fixes an issue where users are unable to login with `COGNITE_AUTH` if capital letters are used in a project name.

## 4.0.6 Feb 11 2022

No changes. Prev version couldn't make it to the NPM.

## 4.0.5 Feb 10 2022

- Bump version of tenant-selector to 0.14.1 to fix an issue with page scroll on mobile.

## 4.0.4 Feb 4 2022

- Fixed path for local auth-utils package that broke after the tenant selector was changed
- Fixed some other minor Rollup build errors (Unresolved/Circular dependencies)

## 4.0.3 Feb 3 2022

- Fixed a problem with CDF project validation case-sensitiveness

## 4.0.2 Feb 3 2022

- Support legacy PR preview format: https://pr-xxxx.appname.preview.cogniteapp.com

## 4.0.1 Feb 2 2022

- Use new `auth-utils` with `reauth` option when doing reauth `loginAndAuthIfNeeded` call
- Fix bug in domain redirection of tenant-selector

## 4.0.0 Jan 27 2022

- Replaced `Tenant selector with @cognite/cdf-hub-tenant-selector`
- Extended functionality to allow dynamic cluster list

## 3.0.0 Dec 17 2021

- Added `ReactQueryDevtools` by default
- Extended sidecar options to disable `ReactQueryDevtools`

## 2.2.2 Nov 18 2021

- Moved `storage.init` into a useEffect hook
- Removed old `REACT_APP_E2E_MODE` from `getAuthHeaders` (this is replaced by fakeIdp)
- Changed `getAuthHeaders` manual `React.useContext` into `useAuthContext`
- Add `queryClient.clear()` into `reauthenticate`
- Add `authClient.invalidateAuth` into `reauthenticate`

## 2.2.1 Nov 9 2021

- Bump to have latest `@cognite/react-sentry` with sentry releaseId fixed.

## 2.2.0 Oct 25 2021

- Add `sentrySettings` to react-container props.

Usage example:

```js
<ReactContainer
  sidecar={sidecar}
  sentrySettings={{
    disableAdvancedTracking: true,
    ignoreErrors: [
      /*...*/
    ],
  }}
/>
```

## 2.1.1 Oct 25 2021

- Bump to have latest `@cognite/react-sentry` with `rrweb` installed.

## 2.1.0 Oct 15 2021

- Bump to update Sentry deps (to get 0.2.0 rrweb)

## 2.0.1 Oct 15 2021

- Logout.tsx: redirect to '/' after calling logout instead of constructing incorrect URL

## 2.0.0 Oct 05 2021

- Bump version for auth-utils

## 1.8.5 Oct 01 2021

- Add support for legacy 'user sync' to UMS.

## 1.8.4 Sept 24 2021

- Add `getHeaders` helpers

## 1.8.2 Sept 20 2021

- Use the `SidecarConfig` type from '@cognite/sidecar' package.

## 1.8.1 Sept 20 2021

- Avoid calling azure on logout, when using FakeIdp

## 1.8.0 Sept 16 2021

- Add `syncUser` for syncing user information with **user management service**

## 1.7.1 Sept 10 2021

- add `getHeaders`

## 1.7.0 August 31 2021

- Handle legacy logout in `Logout` component.

## 1.6.2,3,4 August 27 2021

- Bump deps: auth-utils

## 1.6.1 August 25 2021

- Bump deps

## 1.6.0 Aug 24 2021

- Add React Query provider
- Add `disableReactQuery` prop and enabled React Query provider by default

## 1.5.0 Aug 03 2021

- BREAKING: Change Logout component to take into account Azure AD. Please check demo app for usage.
- Added `useAuthContext` to easily get auth context.

## 1.4.1 Jul 08 2021

- Fixed infinite loading bug when no login flow is found

## 1.4.0 Jul 02 2021

- Bump TSA to change fake idp settings to add new fields

## 1.3.6 Jun 25 2021

- Add `project` parameter to Intercom component

## 1.3.4 Jun 2021

- Disable translations from hosted TSA (your app should have it's own tsa translations now)

## 1.3.3 Jun 2021

- Upgrade tenant selector

## 1.3.1 Jun 17 2021

- Bump auth-utils
- Add `reauthenticate` method into auth state, which you can call after a 401 from an external service

## 1.3.0 Jun 17 2021

- NOTE: only use this version and higher if you do NOT use the hosted TSA version!
- Add peer dep for SDK to align versions
- Include cogs.css import

## 1.2.10 Jun 10 2021

- BROKEN, use v1.3

## 1.2.7 Jun 4 2021

- Bump tsa to v1.2.9 and auth-utils to 1.0.6

## 1.2.6 Jun 2 2021

- Bump tsa to v1.2.7

## 1.2.5 May 27 2021

- Bump auth-utils to v1.0.5

## 1.2.4 May 25 2021

- Bump tsa to v1.2.5

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
