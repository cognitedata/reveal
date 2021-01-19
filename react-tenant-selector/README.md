# React Tenant Selector

This is the core of the Tenant Selector application.

Which all Cognite App's use at the '/' path.

But it is used directly in `react-container`, which all Cognite App's should use at their main setup component.

This provides a way to use the tenant selector logic using localhost development.

## General Flow

```
@cognite/YOUR_APP
|-> @cognite/react-container
    |-> @cognite/auth-utils
    |-> @cognite/react-tenant-selector
        |-> @cognite/auth-utils
```

## How to enable 'Login with Azure'

You need to have the following fields in your sidecar:

  `AADClientID`
  `AADTenantID`

See [@cognite/auth-utils](https://github.com/cognitedata/frontend/blob/master/packages/browser/commonjs/auth-utils/README.md) for more info on how to setup Azure login.

## How to run this component locally

You can make changes and test them loally with the storybook here (`yarn storybook`)

If you want to test this workflow against the demo app, you will need to link it up locally with yalc:

(Note: we use [yalc](https://github.com/wclr/yalc#installation) to avoid the react hook errors during local dev)

`$ yarn build`
`$ yalc publish`

Then inside of your local `react-demo-app` run:

`$ yalc add @cognite/react-tenant-selector`

After all this is setup, any changes of `react-tenant-selector` may be seen by simply doing:

`$ yalc push`

in this folder and then going to your `react-demo-app` and restarting the server: `ctrl+c` -> `yarn start`

## Trouble running this locally?

Try skipping linking and yalc all together:

```
yarn build && cp dist/* ~/dev/cognite/react-demo-app/node_modules/@cognite/react-tenant-selector/dist  
```

## Still getting the 'react hooks' error of doom?

Make sure you are using:

    "@cognite/metrics": "^1.0.0",

Previous versions of metrics packaged react in this module, and trigger this error.
