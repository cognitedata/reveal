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

or

```js
import { Metrics } from '@cognite/metrics';

class MyComponent extends React.Component {
  metrics = Metrics.create();

  onItemClicked = (itemId) => {
    metrics.track('MyComponent.onItemClicked', { itemClicked: itemId });
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

### Performance Metrics

Initializing the PerformanceMetrics instance.

```js
import { PerfMetrics } from '@cognite/metrics';

/**
 * Initialize the PerfMetrics instance
 *
 * @param {string} url : URL to the frontend metrics service
 * @param {string} accessToken : Current user's access token
 * @param {string} project : Current project/tenant id
 * @param {string} appId : Current app id (for legacy projects only)
 * */

PerfMetrics.initialize(
  `${SIDECAR.frontendMetricsBaseUrl}/${tenant}`,
  accessToken,
  tenant
);
```

Enabling

```js
import { PerfMetrics } from '@cognite/metrics';

PerfMetrics.enable();
```

Disabling

```js
import { PerfMetrics } from '@cognite/metrics';

PerfMetrics.disable();
```

Performing basic performance tracking e.g timing duration of an event.

```js
import { PerfMetrics } from '@cognite/metrics';

const Component = () => {
  const eventHandler = () => {
    //event started
    PerfMetrics.trackPerfStart('SEARCH_ACTION_DATA_UPDATED', 'SEARCH', false);
    //do something
    //event ended
    PerfMetrics.trackPerfEnd('SEARCH_ACTION_DATA_UPDATED')
  }
  return ...
}

```

Tracking changes in the DOM and using it to time events. Under the hood we use a MutationObserver to observe the DOM for changes and fire a callback when those changes are observed. The `observeDom` function needs a DOM reference to a HTML/React Component it can observe for changes.

The following observer should fire when it finds the DOM element below added or removed from the DOM :

```html
<div data-testid="table-row"></div>
```

Code:

```js
import { PerfMetrics } from '@cognite/metrics';

const Component = () => {
  const tableRef = useRef<any>();
  const onRowExpand = () => {
    PerfMetrics.trackPerfStart('SEARCH_TABLE_EXPAND_ROW');
  }
  useEffect(() => {
    PerfMetrics.observeDom(tableRef, (mutations: MutationRecord[]) => {
      PerfMetrics.findInMutation({
        mutations: mutations,
        type: 'childList',
        searchIn: ['addedNodes', 'removedNodes'],
        searchFor: 'attribute',
        searchBy: 'data-testid',
        searchValue: 'table-row',
        callback: (output: any) => {
          if (output.addedNodes) {
            PerfMetrics.trackPerfEnd('SEARCH_TABLE_EXPAND_ROW');
          }
        },
      });
    });
  }, [data]);
  return <div ref={tableRef}>
  ...
  </div>
}
```

Tracking DOM events and measuring duration of those events.

```js
import { PerfMetrics } from '@cognite/metrics';
const Component = () => {
  const tableRef = useRef<any>();

  useEffect(() => {
    /**
     * @param {string} name : Name of tracking event
     * @param {keyof HTMLElementEventMap} eventType : DOM Event listener to attach (e.g click, keypress, mouseenter)
     * @param {string} domSelector : a simple string that selects the DOM element you want to attach the listener to
     * @param {number} selectIndex : index of the element to attach the listener to, in case of multiple DOM elements
     * @param {MutableRefObject<HTMLElement | null>} ref : a reference of the current React Component, we will query for DOM elements matching the selector inside here.
     * */
    PerfMetrics.trackPerfEvent(
      'SEARCH_CHECKBOX_CLICKED',
      'click',
      tableRef,
      'input[type=checkbox]',
      1
    );
    return () => {
      PerfMetrics.untrackPerfEvent('SEARCH_CHECKBOX_CLICKED');
    };
  }, [data]);
  return <div ref={tableRef}>
  ...
  </div>
}
```

## Testing

Unit tests should stub out this library.
The library provides some boilerplate stubbed-out implementations for [jest].
In order to use this, import `@cognite/metrics/dist/mocks` somewhere in your tests -- probably in `src/setupTests.ts`.

```ts
import * as mocks from '@cognite/metrics/dist/mocks';

jest.mock('@cognite/metrics', () => mocks);
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
