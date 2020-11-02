# @cognite/react-container

** _Your friendly opinionated Cognite React container._ **

[Cognite React Demo App](https://github.com/cognitedata/react-demo-app/) is the shell to get your project setup quickly.

This container (and set of tools) is the companion to enable you to leverage the previous (and on going) work across all the Cognite Application teams.

Here we provide the nesessary foundation to start a fully working and authenticating application.

## Installation

```sh
yarn add @cognite/react-container
```

## Main container Usage (TODO)

```ts
import { Container } from '@cognite/react-container';

<Container>... my app now has all the fun stuff ...</Container>;
```

The fun stuff includes:

- i18n container
- Optional Redux provider
- Error boundary
- React router setup
- CDF Authentication and token management

## Other helpers (TODO)

### `getLoginToken`

> Get the current login token (saved in localstorage)

```ts
import { getLoginToken } from '@cognite/react-container';
```

### `storage`

> Helpers for accessing localstorage

```ts
import { storage } from '@cognite/react-container';
```

## Future features

- [ ] Authentication container
- [ ] Global Store container
- [ ] Lots of useful hooks
- [ ] Cognite SDK helpers (singleton generator etc)
