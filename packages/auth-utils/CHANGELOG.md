## 1.0.8 Jun 9 2021

- Set `project` after FakeIdp login

## 1.0.7 Jun 9 2021

- Migrate to Bazel setup

## 1.0.6 Jun 7 2021

- Fix bug in initial login if token already exists

## 1.0.5 May 27 2021

- Set user email when logging in

## 1.0.4 May 21 2021

- Always create new client for FAKE_IDP flow
- Update logout to also reset the SDK client
- Refactor some generic methods
- Add new project fetching since tokens/inspect returns projects now

## 1.0.3 May 18 2021

- final fixes for FAKE_IDP flow
- removed all the old storage stuff (refactor to only use @cognite/storage)
- flattened folders since there is only 1 file now (+ some minor utils)

## 1.0.2 May 11 2021

### Changes

- Fix silent token request type (silentCDFTokenRequest)

## 1.0.1 May 10 2021

### Changes

- Fix issue when no auth cookies/ls exists

## 1.0.0 May 5 2021

### Changes

- Upgrade to SDK v4

## 0.8.2 Mar 16 2021

### Changes

- Expose ID token from auth results

## 0.8.1 Feb 25 2021

### Changes

- Add mocks

## 0.8.0 Feb 22 2021

### Changes

- Restore URL state after auth redirect

## 0.7.1 Feb 17 2021

### Changes

- `COGNITE_AUTH` now exposes `email` and `tokens`

## 0.7.0 Feb 17 2021

### Changes

- Add `username` and `email` to AuthenticatedUser

## 0.6.0 Feb 12 2021

### Changes

- Moved where `initialized = true` begins
- Added extra `project` state set for AZURE_AD flow
- Added some extra error messages
- Cleaned up some old chaining logic

## 0.5.0 Feb 11 2021

- Stop endless login redirect loop
- Save the chosen user and use that if you have multiple active logins
- Add error state updates

## 0.4.0 Feb 1 2021

### Changes

- Refactored to remove localstorage
- options in constructor are now:
  1. flow
  2. cluster
  3. aad
  4. adfs

## 0.3.0 Jan 22 2021

### Changes

- Exposed `retrieveAuthResult` to get the token from LS directly

### Beaking changes

- Removed msalConfig from the constructor options (it is now generated from the two keys below)
- Added azureAdClientId and azureAdTenantId
