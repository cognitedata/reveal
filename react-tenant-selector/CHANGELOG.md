## 1.0.1 May 5 2021

### Changes

- Bump auth

## 1.0.0 May 5 2021

### Changes

- Upgrade to SDK v4 (via auth-utils)
- Fixed `https://apps-api.${cluster}.cognite.ai/tenant` order for cluster selector
- Tidy up 'advanced options'
- Make project selection card background wrap whole card

## 0.6.9 Mar 25 2021

### Changes

- Bump react-i18n from `0.3.0` to `0.3.1`

## 0.6.7 Mar 24 2021

### Changes

- Move cogs.js to be a peerDependency instead of a dependency

## 0.6.4 Mar 16 2021

### Changes

- Bump auth-utils to get updated types

## 0.6.3 Mar 1 2021

### Changes

- Show errors from Azure login in a nicer way

### Extras

- Refactor CardFooterError -> Error
- Add ErrorExpandable
- Fix naming issue with LoginWithAzureAD -> LoginWithADFS
- Update cogs

## 0.6.2 Feb 26 2021

### Changes

- Add `disableLegacyLogin` option

## 0.6.1 Feb 24 2021

### Changes

- Make sure authClient is only setup once

## 0.6.0 Feb 24 2021

### Changes

- Make sidecar a prop
- Bump auth-utils to 0.8.0
- Minor style updates

## 0.5.0 Feb 24 2021

### Changes

- Update cluster selection logic

### Changes

- Make sidecar a prop
- Bump auth-utils to 0.8.0
- Minor style updates

## 0.4.3 Feb 18 2021

### Changes

- Bump auth-utils

## 0.4.2 Feb 16 2021

### Changes

- rename AADClientID -> aadApplicationId

## 0.4.1 Feb 12 2021

### Changes

- Add disabled option for translations

## 0.4.0 Feb 10 2021

### Changes

- Updated to use auth-utils@0.5.0
- Upgraded to use new container (in syn with new auth-utils)
- Refactored project selector to new component for new flow
- Use react-query for project selection
- allow locize settings to be overwritten from process.env
- remove old getCuster as it's in sidecar now

## 0.3.1 Jan 25 2021

### Changes

- Use useTranslation from @cognite/react-i18n not directly from react-i18Next
  The reason is to mitigate the i18n setup errors when we don't use the exact initialized verison

## 0.1.0 Jan 8 2021

### Changes

- Initial refactor out of TSA
