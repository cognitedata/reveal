## 0.6.0 - February 7 2022

### Features

- Add `extraConfigs` option to the `configureI18n` function in order to allow any other arbitrary i18next option (#1876) (@rhuanbarreto)

## 0.5.0 - August 25 2021

- Bump deps

## 0.4.0 - May 14 2021

### Changes

- Add dep on @cognite/storage
- Expose project id more easily <- useful for caching
- Removed old wait option <- this fixes some warnings
- Remove metrics, since this is generally loaded before metrics now

## 0.3.3 - May 10 2021

### Changes

- Export type ConfigureI18nOptions
- Introduced new prop: keySeparator to enable simple keys.
  - This is an option from the main react-i18n package

## 0.3.2 - Mar 25 2021

### Changes

- Expose saveMissing and updateMissing properties so apps are able to opt-out

## 0.3.0 - Feb 12 2021

### Changes

- Add disabled prop to return noop translations (useful as a workaround for blocked networks)

## 0.2.4 - Feb 5 2021

### Changes

Feat: return i18n instance after configure is complete

## 0.2.3 - Jan 25 2021

Feat: add option `localStorageLanguageKey`

## 0.2.2

Chore: typescript type fixes

## 0.2.1

Feat: bumped libs - "i18next": "^19.8.4", - "react-i18next": "^11.8.5",
