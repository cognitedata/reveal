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

This is recommended to be done at the highest level in your `App.tsx` file.

```ts
import { Container } from '@cognite/react-container';

<Container sidecar={sidecar}>
  ... my app now has all the fun stuff ...
</Container>;
```

The prime example can be found in the demo app [here](https://github.com/cognitedata/applications/blob/master/apps/react-demo-app/src/App.tsx#L16)

## Overview

![alt text](./overview.png 'Hover text really needs a good joke here...')

## Details about the fun stuff

This container includes:

- Error Boundary
- React Query
- Loop Detector
- Sentry setup
- i18n container
- React router setup
- Authentication provider - This makes sure your app is always authenticated and provides an initiated Cognite SDK

## How to disable unwanted features

The container has one prop of the sidecar. You can add these keys to your sidecar:

```
  disableTranslations: false
  disableLoopDetector: false
  disableSentry: false
  disableIntercom: false
  disableReactQuery: false
```

## How to access auth information

### `AuthConsumer`

> Get the current login token

```ts
import { AuthProvider } from '@cognite/react-container';

...

const authState = useContext(AuthProvider)
```

> or wrap some of your components:

```ts
import { AuthConsumer } from '@cognite/react-container';

...

<AuthConsumer>
  {({ authState }) => {
    console.log('Auth state information:', authState);
  }}
</AuthConsumer>
```

### `storage` (Marked for refactoring to a separate package)

> Helpers for accessing localstorage

```ts
import { storage } from '@cognite/react-container';
```

## Future features

- [ ] Optional Redux provider
- [ ] Global Store container
