# @cognite/metrics

A shareable NPM package for doing metrics logging from frontend applications.

## Getting started

To start, you need to initialize with a [mixpanel] token:

```js
import { Metrics } from '@cognite/metrics';

Metrics.init({ mixpanelToken: '123456' });
```

After that, `Metrics` is ready to go.

## Tracking events

To track events, use the `track` method:

```js
import { Metrics } from '@cognite/metrics';

class MyComponent extends React.Component {
  metrics = Metrics.create('MyComponent');

  onItemClicked = (itemId) => {
    metrics.track('onItemClicked', { itemClicked: itemId });
    // ...
  };

  // ...
}
```

There is also a hook you can use in functional components:

```js
import { useMetrics } from '@cognite/metrics';

const MyComponent = () => {
  const metrics = useMetrics('MyComponent');
  // ...
};
```

### Metadata

You can pass metadata with an event.
This can be anything that mixpanel allows in the [properties field].

## Timing events

Events can also be timed using the `start` and `stop` methods:

```js
import { Metrics } from '@cognite/metrics';

const MyComponent = () => {
  const metrics = useMetrics('MyComponent');

  const onLoadChildren = (itemId) => {
    const timer = metrics.start('onLoadChildren', { parentId: itemId });
    childLoader.load(itemId).then((children) => {
      timer.stop({ numberOfChildren: children.length });
      // ...
    });
  };
  // ...
};
```

### Metadata

You can pass metadata along with timers, on either `start` or `stop`.
These are then combined and the union is passed up to mixpanel.

## Identifying people

To identify users, use the `identify` method:

```js
import { Metrics } from '@cognite/metrics';

Metrics.identify('someone@example.com');
```

Note that this will not work unless `Metrics.init(..)` has been called.

### Adding person metadata

To log metadata about an individual, pass an object into the `people` method:

```js
import { Metrics } from '@cognite/metrics';

Metrics.people({ name: 'Foo', company: 'Bar AS', numberOfProducts: 10 });
```

### Opting out of / in to tracking for a user

To opt a user out or in from tracking use the following methods.

```js
import { Metrics } from '@cognite/metrics';

Metrics.optIn(options?);
Metrics.optOut(options?);
```

To check if a user is opted out:

```js
import { Metrics } from '@cognite/metrics';

Metrics.hasOptedOut(options?);
```

Options are passed down to underlying library.
See [the documentation] for possible options.

## Testing

Unit tests should stub out this library.
The library provides some boilerplate stubbed-out implementations for [jest].
In order to use this, import `@cognite/metrics/jest-mocks` somewhere in your tests -- probably in `src/setupTests.ts`.

```ts
import '@cognite/metrics/jest-mocks';
```

### Storybook

When run in a [storybook], the mocking isn't quite as automagic.
However, it's a pretty small change.
In `.storybook/webpack.config.js`, add this to the `config.resolve.alias` object:

```js
config.resolve.alias['@cognite/metrics'] = '@cognite/metrics/dist/mocks';
```

A complete sample looks like this:

```js
module.exports = ({ config }) => {
  config.resolve.alias['@cognite/metrics'] = '@cognite/metrics/dist/mocks';
  return config;
};
```

[mixpanel]: https://mixpanel.com
[properties field]: https://mixpanel.com/help/reference/javascript-full-api-reference#mixpanel.track
[the documentation]: https://developer.mixpanel.com/docs/javascript-full-api-reference#mixpanel.opt_in_tracking
[jest]: https://jestjs.io/
[storybook]: https://storybook.js.org/
