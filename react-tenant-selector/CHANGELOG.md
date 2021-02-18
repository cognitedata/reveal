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
