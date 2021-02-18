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
