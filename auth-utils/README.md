# Cognite Auth Utils (JavaScript)

The auth layer for all Cognite apps

## Installation

```sh
yarn add @cognite/auth-utils
```

## The purpose of this repo

To have all cognite app authentication logic on place so no developer needs to re-implement it again.

## What will this repo do

It will support

- Cognite Custom Auth (input project and cluster)
- Support ADFS 2016
- Support Azure AD Multi Tenant Applications

Long term

- Support any OIDC provider that Cognite supports eg: OKTA, GOOGLE, AUTH0 you name it.

## How to use

1. Make an App in Azure by copying:

1a - the module: https://github.com/cognitedata/terraform-cognite-modules/tree/master/aad-app-registrations/cognite-demo-app
1b - the app: https://github.com/cognitedata/terraform/tree/master/aad-app-registrations/react-demo/dev

Note: in the future perhaps we can make a more generic module everyone can use.

1. Manually set replyUrlsWithType:spa

We cannot terraform this yet: https://github.com/terraform-providers/terraform-provider-azuread/issues/286

To fix this you will have to become an owner of your tenant and make the changes on the '' page

We need this because:

- Only in 'SPA' mode do you get CORS headers for the token request

3. After this is done, you need to go to this app and get your values:

https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

4. Configure your tenant:

You will need to enable oidc settings in Fusion for your tenant here: https://unleash-apps.cognite.ai/#/features/strategies/AUTH_oidc_config

Then follow the steps to fill that form in: (https://cognitedata.atlassian.net/wiki/spaces/AUTH/pages/1955397887/How+to+get+started+with+Native+Tokens+in+AAD#2.-How-to-configure-a-CDF-project-for-Native-Tokens)

Note: $AZURE_AD_TENANT_ID === Directory (tenant) ID from AAD

Some things to copy paste since that above link only has images:

JWKS URL: https://login.microsoftonline.com/<AZURE_AD_TENANT_ID>/discovery/v2.0/keys
Issuer: https://sts.windows.net/<AZURE_AD_TENANT_ID>/
Audience: https://api.cognitedata.com
Access claims: groups, roles
Scope claims: scp
Log claims: groups, roles, scp, iss, aud, sub

5. Add `projects:list` to your default group

This can only be done via POSTMAN at the moment, as it's not in fusion yet. [Jira Story](https://cognitedata.atlassian.net/browse/AUTH-457?focusedCommentId=102987)

See all groups:
GET https://{{cluster}}.cognitedata.com/api/v1/projects/{{project}}/groups?all=true

Add a new group, via something like:

POST https://{{cluster}}.cognitedata.com/api/v1/projects/{{project}}/groups

BODY:

```
  {
    items: [
      {
        name: 'read:all',
        source: 'role',
        sourceId: '470ead9b-9ea2-440d-9ca8-b11cb1a52987',
        capabilities: [
          { projectsAcl: { actions: ['READ', 'LIST'], scope: { all: {} } } },
          { assetsAcl: { actions: ['READ'], scope: { all: {} } } },
          { datasetsAcl: { actions: ['READ'], scope: { all: {} } } },
          { eventsAcl: { actions: ['READ'], scope: { all: {} } } },
          { filesAcl: { actions: ['READ'], scope: { all: {} } } },
          { groupsAcl: { actions: ['READ'], scope: { all: {} } } },
          { sequencesAcl: { actions: ['READ'], scope: { all: {} } } },
          { timeSeriesAcl: { actions: ['READ'], scope: { all: {} } } },
          { geospatialAcl: { actions: ['READ'], scope: { all: {} } } },
          { labelsAcl: { actions: ['READ'], scope: { all: {} } } },
          { seismicAcl: { actions: ['READ'], scope: { all: {} } } },
        ],
      },
    ],
  };
```

Then make sure to set that new group as default. You can add or remove any other acl's, the most important is just that `projectsAcl` one.

The `sourceId` is related to the `groups` field in your access token

To figure out what those UUID's from the `groups` in your access token mean, you can goto: https://portal.azure.com/#blade/Microsoft_AAD_IAM/GroupsManagementMenuBlade/AllGroups

This group here that is set on the above group, is all users: 470ead9b-9ea2-440d-9ca8-b11cb1a52987

So you need to have a tenant with something like this.

## Troubleshooting:

### Need admin approval

_YOUR_APP_NAME_ needs permission to access resources in your organization that only an admin can grant. Please ask an admin to grant permission to this app before you can use it.

-> make sure you are using the right cluster in your tenant setup OIDC settings

### Need admin approval

GET /projects/list 403

-> make sure you have projects:list for the default group in Fusion (for now, manually add)
