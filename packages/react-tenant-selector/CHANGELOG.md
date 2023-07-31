## 2.1.2 July 28 2022

- always use sidecar.cdfCluster as the initial one

## 2.1.0 Jan 24 2022

- Only show projects the user has groups for in project selector list

## 2.0.2 Oct 15 2021

- Re-build

## 2.0.1 Oct 13 2021

- Add better warning when fake IDP is not started

## 2.0.0 Oct 5 2021

- Bump version for auth-utils

## 1.4.1 Sept 20 2021

- Use the `SidecarConfig` type from '@cognite/sidecar' package.

## 1.4.0 August 25 2021

- Bump deps

## 1.3.1 August 03 2021

- Fix cogs icon deprecation notices

## 1.3.0 July 02 2021

- Add extra fakeIdp options to token body

## 1.2.15 June 25 2021

- Change path of `utils` import in LoginWithFakeIDP

## 1.2.13 June 2021

- Update loading states of buttons
- Add extra error handling to initial login
- Fix card auto resize (by removing it)

## 1.2.12 June 2021

- Add `customExpiry` to fakeIdp options

## 1.2.11 June 2021

- Release to bump auth-utils

## 1.2.10 June 2021

- Add given_name and family_name to fake-idp token generation options
- First release post transition into applications mono repo

## 1.2.9 June 2021

- Bump auth-utils to v1.0.6

## 1.2.8 June 2 2021

- Pass `project` into fake idp `/login/token` as a body param

## 1.2.7 June 1 2021

- Add `disableAzureLogin` option to sidecar disable the azure login button

## 1.2.6 May 27 2021

- Bump auth-utils to v1.0.5

## 1.2.5 May 25 2021

- Disable fake idp login if not on current cluster

## 1.2.4 May 21 2021

- Add nicer fallback when projects fetching fails
- Logout if there is an error fetching projects
- Add logout button to projects page, to allow users to back out
- Use new project fetching from auth-utils

- ## 1.2.3 May 20 2021

- Add 'name' option to fake idp buttons

## 1.2.1 May 18 2021

- Bump auth to get better FAKE_IDP support

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
