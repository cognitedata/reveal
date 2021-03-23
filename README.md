# Digital Cockpit

Cognite Digital Cockpit allows heavy industry users to accumulate all their applications, use cases (such as dashboards from analytics and visualization tools like PowerBI, Grafana, Plotly dash, Spotfire, etc.), and helpful links into one place, suites, for the organization. These solutions can be implemented and delivered by Cognite or by other 3rd parties. To ensure governance, the system administrator can create, edit, and delete suites into logical themes that reflect the organization’s work areas. The system administrator also gives access to the relevant suites or work areas based on groups or roles defined in MS Azure Active Directory linked to Cognite Data Fusion (CDF).

With live data from embedded dashboards & infographics overview of your KPIs, you can quickly get an overview of your organization´s status.

For more information please read the [https://pr-567.docs.preview.cogniteapp.com/cockpit/guides/getstarted.html](documentation)

## Setup a new tenant for Digital Cockpit

### Setup user groups

All user groups has to be linked to the groups in source IdP system (e.g. AAD groups). Other user groups will not show up in the Digital Cockpit application.

**Admin** group name in CDF: `dc-system-admin`
Required capabilities for the **dc-system-admin** group: `raw:read, raw:write, groups:list(all), files:read, files:write, datasets:read, datasets:write`

Required capabilities for a **regular user** group: `groups:list(currentUser), files:read`

### Generate api-keys for all tenants that will be used by Digital Cockpit.

The api-key is used by [https://github.com/cognitedata/application-services/tree/master/services/digital-cockpit-api](digital-cockpit-api) to store&fetch _suites_ and _user data_ in CDF Raw database. Required capabilities for the **api-key** service account:
`raw:read, raw:write, groups:list(all)`

### Whitelist the following domains on tenants:

- `staging.digital-cockpit.cogniteapp.com`
- `digital-cockpit.cogniteapp.com`
- `*.digital-cockpit-dev.preview.cogniteapp.com`
- `*.digital-cockpit.preview.cogniteapp.com`

### Create RAW database

Name: `digital-cockpit`

Tables:

- `suites`
- `lastVisited`

### Create a data set for image files (optional)

The data set is used to store image files such as board previews and a customer logo.

This is optinal requirement since when system admin logs in to the app for the first time, the _data set_ will be created automatically with attribute `externalId='digital-cockpit'`.

Creating it manually gives you possibility to restrict the capability `files:write` and `files:read` to this data set for the **dc-system-admin** group, and also more options in configuring the data set itself.

Creating it manually gives you more options in configuring the data set itself. When created it also gives possibility to restrict the capability `files:write` and `files:read` to this data set for the system admin group.

**Name**: `digital-cockpit`

**ExternalId**: `dc_img_preview_storage`
