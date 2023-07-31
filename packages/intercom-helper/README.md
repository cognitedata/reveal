# @cognite/intercom-helper

A collection of Intercom methods, including handling of Intercom Identity Verification.

## Installation

```sh
yarn add @cognite/intercom-helper
```

## How to use

Before anything else, start by initializing Intercom.

```js
import { intercomInitialization } from '@cognite/intercom-helper';

// app_id can be taken from a sidecar
intercomInitialization(app_id);

// or can be used as a promise
intercomInitialization(app_id).then(() => {
  // do stuff after initialization finished
});
```

Start by calling the `boot` method.

```js
import { intercomHelper } from '@cognite/intercom-helper';

intercomHelper.boot({
  // app_id can be taken from a sidecar
  app_id: app_id,
  name: name,
  email: email,
  user_id: user_id,
  hide_default_launcher: true,
});
```

Once the `boot` method has been called you should call the `identityVerification` method.

```js
import { intercomHelper } from '@cognite/intercom-helper';

intercomHelper.identityVerification({
  // appsApiUrl can be taken from a sidecar
  appsApiUrl: 'url to apps api',
  headers: {
    Authorization: 'bearer token',
  },
});
```

`user_id` can only be manually set on boot, and is automatically set by the `identityVerification` method.
`user_id` is not meant to be modified by the `update` method.

You can see an example of this setup in [`react-demo-app`](https://github.com/cognitedata/react-demo-app/blob/master/src/pages/Intercom/Intercom.tsx).
