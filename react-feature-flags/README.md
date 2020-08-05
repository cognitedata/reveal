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
import {
  FlagProvider,
} from '@cognite/react-feature-flags';

// Your main app component
const App = () => {
  return (
    <FlagProvider
      projectName="my-project"
      appName="unified-demo-app"
      apiToken="<api-token>"
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


## Testing
This package exports jest-mocks.

In your **setupTests** file do this:
```js
import '@cognite/react-feature-flags/jest-mocks';
```

This will cause unleash-proxy-client module to be mocked in jest.

### Stubbing client methods

```js
import { clientMock } from '@cognite/react-feature-flags/jest-mocks';
```
use them in a test like this:

```js
import { FlagProvider, useFlag } from '@cognite/react-feature-flags';
import { clientMock } from '@cognite/react-feature-flags/jest-mocks';

describe('FeatureToggle', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const ToggledDiv = () => {
    const isEnabled = useFlag('test');
    return <div>{isEnabled ? 'enabled' : 'disabled'}</div>;
  };

  const RenderedComponent = (
    <FlagProvider appName="not used" apiToken="not used" projectName="not used">
      <ToggledDiv />
    </FlagProvider>
  );

  it('Should find the correct exports', () => {
    // Mutate the client mock function "isEnabled" using jest 
    clientMock.isEnabled.mockReturnValueOnce(true);
    render(RenderedComponent);

    expect(screen.getByText('disabled')).toBeDefined();
  });

});

```
