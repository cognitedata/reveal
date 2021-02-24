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

<Container>... my app now has all the fun stuff ...</Container>;
```

The prime example can be found in the demo app [here](https://github.com/cognitedata/react-demo-app/blob/master/src/App.tsx#L18)

## Overview

![alt text](./overview.png 'Hover text really needs a good joke here...')

## Details about the fun stuff

This container includes:

- Error boundary
- React router setup
- Authentication provider - This makes sure your app is always authenticated and provides an initiated Cognite SDK
- i18n container
- LocalStorage helpers

## How to access auth information

### `AuthConsumer`

> Get the current login token

```ts
import { getLAuthProvideroginToken } from '@cognite/react-container';

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
