# @cognite/react-sentry

Sentry wrapper

## Installation

```sh
yarn add @cognite/react-sentry
```

## Usage

```sh
import { Sentry } from '@cognite/react-sentry'
```

Note: this comes by default in the @cognite/react-container

Pro Tip - to get the most out of this, also wrap your routes:

```
import { Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';

const SentryRoute = Sentry.withSentryRouting(Route);

...

return (
  <SentryRoute path='/' render={() => <Home />} />
)
```
