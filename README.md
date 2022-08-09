# @cognite/cdf-i18n-utils

Utility library for i18n and locize integration in fusion.

`cdf-i18n-utils-cli` also comes with the package. You can check the docs for it [here](https://github.com/cognitedata/cdf-hub-i18n-utils/blob/main/bin/README.md).

## Lowercase/Uppercase conversion

You can use `lowercase` and `uppercase` post processors to convert translated values. They use `toLocaleLowerCase` and `toLocaleUppercase` functions to utilize the current language.

Usage:
```json
// my-namespace.json
{
  "my-translation-key": "Translated Value"
}
```
```tsx
// MyComponent.tsx
t('my-translation-key', { postProcess: 'lowercase' }) // returns --> translated value

t('my-translation-key', { postProcess: 'uppercase' }) // returns --> TRANSLATED VALUE
```
