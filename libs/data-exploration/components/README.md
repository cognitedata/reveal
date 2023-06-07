# data-exploration-components

The "new" components library for the data exploration components.

This library will ONLY contain "dumb" components. In other words, pure components, where the same input should give same output, and not mutate variables outside its scope. Moreover, state management should managed by the consumer of the component and be passed down to the component -- with an exception to state that are specific to the component (e.g., error state handling based on inputted/passed-in props)

> NB! Components that are more complex (e.g., manage network request, etc...) should be defined in "libs/data-exploration/containers"

> NOTE: In old-school React, you could tell the transpiler that the component were of pure instance by extending it with "React.PureComponent". The somewhat equivalent in functional components are to wrap the component in "React.memo()" -- as such, in "extreme" cases (i.e., with precautions) we can wrap most of the components in this library with React.Memo().

## Goals and expectations

The general goal and expectation for us as a team, is to move all the components that are to be found in "libs/data-exploration" and "apps/data-exploration" into this library.

### Goal

The goal is to have above 80% unit-test coverage and 100% storybook coverage of the components in this library.

### Expectations

All old and new components should have:

1. Storybook with a base example.
2. Unit tests!
   - Rule of thumb, unit tests should cover all the edge-case -- both positive and negative test-cases.
   - Sometimes it's hard to write negative test-cases, and in some cases leaving those out should be fine! Our "main" goal is to catch and prevent regressive code changes (e.g., removing/changing default values that alter the behaviour of the component) with unit tests.

... no PR will be approved with less!

## Running unit tests

Run `nx test data-exploration-components` to execute the unit tests via [Jest](https://jestjs.io).

> PRO TIP: Ever felt the pain of not being able to visualize the components while setting up unit tests?! Fear not, we have a (half-baked) solution: Open a new terminal and navigate to the root of the "fusion" monorepo, and run following command: `yarn test:preview` -- this will open a new tab in your browser with further instructions ;)
