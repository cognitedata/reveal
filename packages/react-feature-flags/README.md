# @cognite/react-feature-flags

The feature flags utilities

## Accessing the unleash UI

[Unleash UI](https://unleash-apps.cognite.ai/)

## Installation

```sh
yarn add @cognite/react-feature-flags
```

## Obtaining an api token

Ask in the [#frontend](https://cognitedata.slack.com/archives/C6KNJCEEA) slack channel

## Usage

### Wrap your app with the **FlagProvider**

```js
import { FlagProvider } from '@cognite/react-feature-flags';

// Your main app component
const App = () => {
  return (
    <FlagProvider
      projectName="my-project"
      appName="unified-demo-app"
      apiToken="<api-token>"
      remoteAddress={window.location.hostname}
    >
      //... flags will be accessible in all children
    </FlagProvider>
  );
};
```

### Use a flag with **useFlag**

```js
import React from 'react';
import { useFlag } from '@cognite/react-feature-flags';
import { Button } from '@cognite/cogs.js';

const ToggledButton = () => {
  const isEnabled = useFlag('DEMO_APP_TEST_FLAG');

  return (
    <Button
      style={{ marginTop: 10 }}
      type={isEnabled ? 'primary' : 'secondary'}
      disabled={!isEnabled}
    >
      The flag DEMO_APP_TEST_FLAG is turned: {isEnabled ? 'ON' : 'OFF'}
    </Button>
  );
};

export default ToggledButton;
```

### Use a flag with **useVariant**

By using variants, we are able return string values instead whenever a feature is enabled. Let's say you have set up a variant in Unleash and you want to access that value whenever the flag `DEMO_APP_TEST_FLAG` is enabled. You can do:

```js
import React from 'react';
import { useVariant } from '@cognite/react-feature-flags';
import { Button } from '@cognite/cogs.js';

const ToggledButton = () => {
  const variantValue = useVariant('DEMO_APP_TEST_FLAG');

  return (
    <Button
      style={{ marginTop: 10 }}
      type={variantValue ? 'primary' : 'secondary'}
      disabled={!variantValue}
    >
      The flag DEMO_APP_TEST_FLAG has the following variant:{' '}
      {variantValue || 'No variant has been set up'}
    </Button>
  );
};

export default ToggledButton;
```

## Testing

This package exports jest-mocks.

In your **setupTests** file do this:

```js
import mocks from '@cognite/react-feature-flags/dist/mocks';

jest.mock('@cognite/react-feature-flags', () => mocks);
```

This will cause unleash-proxy-client module to be mocked in jest.

### Stubbing client methods

```js
import { clientMock } from '@cognite/react-feature-flags/dist/mocks';
```

use them in a test like this:

```js
import React from 'react';
import {
  FlagProvider,
  useFlag,
  useVariant,
} from '@cognite/react-feature-flags';
import { clientMock } from '@cognite/react-feature-flags/dist/mocks';

describe('FeatureToggle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const ToggledDiv = () => {
    const isEnabled = useFlag('test');
    const variant = useVariant('test');
    return (
      <>
        <div>{isEnabled ? 'enabled' : 'disabled'}</div>
        <div>{variant || 'No variant'}</div>
      </>
    );
  };

  const RenderedComponent = (
    <FlagProvider
      appName="not used"
      apiToken="not used"
      projectName="not used"
      remoteAddress={window.location.hostname}
    >
      <ToggledDiv />
    </FlagProvider>
  );

  it('Should find the correct exports', () => {
    // Mutate the client mock function "isEnabled" using jest
    clientMock.isEnabled.mockReturnValueOnce(true);
    clientMock.variant.mockReturnValueOnce('variant');
    render(RenderedComponent);

    expect(screen.getByText('enabled')).toBeInTheDocument();
    expect(screen.getByText('variant')).toBeInTheDocument();
  });
});
```
