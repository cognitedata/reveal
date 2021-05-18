## 1.2.0 May 15 2021

- Change i18n loading
- Sidecar locize props are now:

```
   locize?: {
    apiKey?: string;
    projectId: string;
    version?: string;
    keySeparator?: false | string;
  };
```

## 1.1.2 May 12 2021

### Changes

- Add fake idp option

## 1.1.1 May 11 2021

### Changes

- Bump auth - the issue did not affect this stage of the flow, but good to keep in sync.

## 1.1.0 May 10 2021

### Changes

- Remove i18n configuration
  - It is now setup in the TSA that implements this, or in react-container which uses this.
  - This is because we should only init this once at a high level in the parent application, and since this is just a 'component package' that cannot be run standalone, it should not contain that setup.
- Introduced new sidecar key: `locizeKeySeparator` to enable simple keys.
  - This stops the error `Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.` when it tries to parse the keys from things like 'button-id_title'

## 1.0.1 May 5 2021

### Changes

- Bump auth

## 1.0.0 May 5 2021

### Changes

- Upgrade to SDK v4 (via auth-utils)
- Fixed `https://apps-api.${cluster}.cognite.ai/tenant` order for cluster selector
- Tidy up 'advanced options'
- Make project selection card background wrap whole card

## 0.8.0 May 1 2021

### Changes

- Add advanced azure options (set aad id)

## 0.7.0 April 2021

### Changes

- Remove old domain pattern support

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
