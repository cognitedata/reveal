# @cognite/react-errors

Error-handling utilities for React applications

## Installation

```sh
yarn add @cognite/react-errors
```

## `reportException`

Report a caught exception to [Sentry], and return a `ReportedError` object to the caller.
The caller can then rethrow, show an error message, or do whatever they should do.

```ts
import { reportException } from '@cognite/react-errors';

const FlakyComponent = () => {
  const [errorId, setErrorId] = useState<string>();

  useEffect(() => {
    client.assets
      .list()
      .then(() => {
        console.log('All done');
      })
      .catch((ex) => {
        reportException(ex).then((reportedError) => {
          setErrorId(reportedError.errorId);
        });
      });
  }, []);

  if (errorId) {
    return <span>Reported error: {errorId}</span>;
  }
  return <span>Listing assets ...</span>;
};
```

## `isHttpError`

A simple TypeScript type guard to determine if the given `Error` is an `HttpError` from `@cognite/sdk`.
This allows the caller to do different behavior, like check its status codes.

```ts
import { isHttpError } from '@cognite/react-errors';

client.assets.list().catch((ex) => {
  if (isHttpError(ex)) {
    if (ex.status === 429) {
      // Retry again in a bit.
      return;
    }
  }
  throw ex;
});
```

## `ImpossibleCaseError`

Sometimes TypeScript isn't smart enough to know that you're in an impossible situation and will needlessly warn about it.
This can be remedied by returning early or putting in a if-else to handle a senseless case.
Instead, throw this error.
It will make TypeScript happy, and if you ever wind up in this situation, you'll get a very noticeable crash.

```ts
import { ImpossibleCaseError } from '@cognite/react-errors';

const items: { [key: string]: number | undefined } = {
  /* skip */
};
const squares = Object.entries(items)
  .filter((keyValue) => {
    return !!keyValue[1];
  })
  .map(([key, value]) => {
    if (!value) {
      throw new ImpossibleCaseError(
        'These are definitely all truthy but TS does not know this fact.'
      );
    }
    return value * value;
  });
```

## `UnreachableCaseError`

This is a very useful error to make a compile-time assertion that all possible cases have been handled.

```ts
import { UnreachableCaseError } from '@cognite/react-errors';

type State = 'on' | 'off';

const state: State = determineState();
switch (state) {
  case 'on':
    addFeature();
    break;
  case 'off':
    removeFeature();
    break;
  default:
    throw new UnreachableCaseError(state);
}
```

If `State` is ever expanded to add another state (eg, `'disabled'`) then this will fail to compile until a `case: 'disabled':` case is added.

## `ErrorBoundary`

Cognite apps should never crash.
However, when they do, the user shouldn't get a horrible experience.
Use `ErrorBoundary` to provide a more-pleasant experience for your end users by catching the error and showing a message.

```ts
import { I18nContainer } from '@cognite/react-i18n';
import { ErrorBoundary } from '@cognite/react-errors';

const App = () => {
  return (
    <I18nContainer>
      <ErrorBoundary instanceId="app-root">
        <MyApp /> {/* This can be the router, etc */}
      </ErrorBoundary>
    </I18nContainer>
  );
};

export default App;
```

If your project is configured with [Sentry], then any caught errors will be reported to [Sentry].
Additionally, metrics are logged to [Mixpanel] using [`@cognite/metrics`].
Note that the `ErrorBoundary` supports [i18n] out of the box, so you will need to use [`@cognite/react-i18n`] in the app as well.

## `ErrorId`

A very simple React component to display an error ID to the end user.
This ensures that (at a minimum) it's always called "Error ID" instead of "Error code", "Error", "Issue number", etc.
In the future this could be expanded with features like click-to-copy and so on.

```ts
import { reportException, ErrorId } from '@cognite/react-errors';

const FlakyComponent = () => {
  const [error, setError] = useState<ReportedError>();

  useEffect(() => {
    client.assets
      .list()
      .then(() => {
        console.log('All done');
      })
      .catch((ex) => {
        reportException(ex).then((reportedError) => {
          setError(reportedError);
        });
      });
  }, []);

  if (error) {
    return <ErrorId error={error} />;
  }
  return <span>Listing assets ...</ErrorId>;
};
```

Note that this is integrated with [i18n], so the surrounding app must be wired for [i18n].
Please use [`@cognite/react-i18n`] to make this easier.

## `ErrorWatcher`

The `ErrorWatcher` component has a simple purpose: watch `console` and make its complaints more visible.
When enabled (should probably only be enabled on localhost & preview builds), it will cause the screen to take on a red or yellow tint when there is an error or warning in the console.
If you find this annoying, then fix the problems resulting in `console.error(..)` or `console.warn(..)` :grin:.

This will also allow for increasing the severity of other errors.
For example, if non-unique keys are used (or omitted altogether), the app will crash instead of logging a message in the console.

This is not a container; it simply needs to be in the tree.

```ts
const App = () => {
  return (
    <Provider store={store}>
      <Router basename={tenant}>
        <MyApp />
      </Router>
      <ErrorWatcher />
    </Provider>
  );
};
```

## Mocks

In order to make testing easier in calling applications, things like `reportException` should be stubbed out.
This can be made easier by using the exposed mocks.
These are exported through `@cognite/react-errors/dist/mocks`.

### jest

The mocks can be automatically installed through the [jest] helpers.
These should be added to the calling app's `setupTests.ts` file, like so:

```ts
import '@cognite/react-errors/jest-mocks';
```

[jest]: https://jestjs.io
[i18n]: https://cog.link/i18n
[sentry]: https://sentry.io
[mixpanel]: https://mixpanel.com
[`@cognite/metrics`]: cognitedata/frontend/packages/browser/commonjs/metrics
[`@cognite/react-i18n`]: cognitedata/frontend/packages/browser/react/i18n
