# Cognite React i18n helpers and provider.

Please see [cog/i18n] for more information about the importance of internationalization ([i18n]).

[cog/i18n]: https://cog.link/i18n
[i18n]: https://en.wikipedia.org/wiki/Internationalization_and_localization#Naming

## Setup

Before i18n can be used, the app must be initialized.
This should happen as early as possible in the app's setup routine.
A common place for this to happen is in `src/index.tsx`.

```jsx
import ReactDOM from 'react-dom/client';
import App from 'app';
import { configureI18n } from '@cognite/react-i18n';

configureI18n({
  // Insert options here.
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
```

## Usage

Wrap your app with:

```jsx
import React from 'react';
import { I18nContainer } from '@cognite/react-i18n';

const App = () => {
  return (
    <I18nContainer>
      <MyApp>
    </I18nContainer>
  );
};

export default App;
```

The `<I18nContainer>` can occur anywhere in the tree.
However, there must not be **any** user-visible strings above it in the tree.

## Component usage

```jsx
import { useTranslation, Trans } from 'react-i18next';

const SomeComponent: React.FC = () => {
  const { t } = useTranslation('SomeComponent');

  return (
    <div>
      <h1>{t('example_title', { defaultValue: 'Hello world' })}</h1>

      <Trans t={t} i18nKey="myKey_paragraph">
        This is a translated string! Note that <code>_paragraph</code> suffix on
        the key &emdash; this provides translators with a hint about where this
        string is used (and how long it can be).
      </Trans>
    </div>
  );
};

export default SomeComponent;
```

Note that when `useTranslation` is used with a namespace which has not yet been loaded, the **closest** [Suspense boundary] will be used.
If there is only one root-level `<I18nContainer>`, then the app will visibly flicker.

Instead, smaller [Suspense boundaries] should be used throughout the app.
If it is preferable to wrap every component in a [Suspense boundary], then an [HOC] is provided to aid in that.

### `withI18nSuspense`

The `withI18nSuspense` [HOC] wraps the component in a [Suspense boundary] to provide localized rendering UI.
This prevents disruptive flickering for end users.

```jsx
import { useTranslation, Trans } from 'react-i18next';
import { withI18nSuspense } from '@cognite/react-i18n';

const SomeComponent: React.FC = () => {
  const { t } = useTranslation('SomeComponent');

  return (
    <div>
      <h1>{t('example_title', { defaultValue: 'Hello world' })}</h1>

      <Trans t={t} i18nKey="myKey_paragraph">
        This is a translated string! Note that <code>_paragraph</code> suffix on
        the key &emdash; this provides translators with a hint about where this
        string is used (and how long it can be).
      </Trans>
    </div>
  );
};

export default withI18nSuspense(SomeComponent);
```

## `i18next` usage

If your app needs to use [`i18next`] directly (for example, to listen to language changes), then you should **not** use:

```js
// Don't do this!!
import i18next from 'i18next';

i18next.on('languageChanged', async (lng) => {
  console.log('Hey neat the language changed');
});
```

To ensure the correct instance of [`i18next`] is used, please use the one exported by this package:

```js
import { i18next } from '@cognite/react-i18n';

i18next.on('languageChanged', async (lng) => {
  console.log('Hey neat the language changed');
});
```

## Testing

Unit tests should stub out this library.
Add this to your tests:

```ts
import * as mocks from '@cognite/react-i18n/dist/mocks';
jest.mock('react-i18next', () => mocks);
```

[suspense boundary]: https://reactjs.org/docs/react-api.html#reactsuspense
[suspense boundaries]: https://reactjs.org/docs/react-api.html#reactsuspense
[hoc]: https://reactjs.org/docs/higher-order-components.html
[`i18next`]: https://www.npmjs.com/package/i18next
