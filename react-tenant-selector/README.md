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

You need to have the following field in your sidecar:

`aadApplicationId`

See [Confulence](https://cognitedata.atlassian.net/wiki/spaces/AD/pages/2334818447/Enable+OIDC+Tokens+for+an+Application) for more info on how to setup Azure login.

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

## Process for updating the Tenant Selector

1. Make your changes here (in the `frontend` lib(s))
   1. Update and unit tests/storybooks
   2. NOTE: it is recommended to use storybook to develop any changes
2. Build a local project and test this out
   1. For example to test with the demo app, you can run:
      `yarn build && cp -r dist/* ~/dev/react-demo-app/node_modules/@cognite/react-tenant-selector/dist` (remember to stop the dev server and re-run `yarn start` after doing this)
   2. Or use `yalc`
   3. Or `yarn link`
3. Bump this projects version
4. Bump @cognite/react-container to match that version (so people use it during locahost development)
5. Create a PR and get it deployed
6. Test these changes again in a local project, this time using the versions published from NPM
7. Create a PR for the `tenant-selector` application to use this new version
8. Upgrade your application to use this version of the `tenant-selector` in `release-configs` staging
9. Confirm on staging and proceed to release `tenant-selector` to prod, and update prod `release-configs` for your app
