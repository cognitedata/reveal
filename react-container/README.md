# Cognite React Container

** _Your friendly opinionated Cognite React container._ **

[Cognite React Demo App](https://github.com/cognitedata/react-demo-app/) is the shell to get your project setup quickly.

This container (and set of tools) is the companion to enable you to leverage the previous (and on going) work across all the Cognite Application teams.

Here we provide the nesessary foundation to start a fully working and authenticating application.

## Installation

```sh
yarn add @cognite/react-container
```

## Main container usage

```ts
import { Container } from '@cognite/react-container';

<Container appName="demo-app">... my app now has all the fun stuff ...</Container>;
```

This can be found in the demo app [here](https://github.com/cognitedata/react-demo-app/blob/master/src/App.tsx#L18)

The fun stuff includes:

- Error boundary
- React router setup
- Authentication provider - This makes sure your app is always authenticated and provides an initiated Cognite SDK
- i18n container
- LocalStorage helpers

## Other helpers

### `getLoginToken`

> Get the current login token (saved in localstorage)

```ts
import { getLoginToken } from '@cognite/react-container';
```

### `storage` (Marked for refactoring to a separate package)

> Helpers for accessing localstorage

```ts
import { storage } from '@cognite/react-container';
```

## Future features

- [ ] Optional Redux provider (Not complete)
- [ ] Global Store container
- [ ] Lots of useful hooks
