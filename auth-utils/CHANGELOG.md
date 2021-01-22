## 0.3.0 Jan 22 2020

### Features

- Exposed `retrieveAuthResult` to get the token from LS directly

### Beaking changes

- Removed msalConfig from the constructor options (it is now generated from the two keys below)
- Added azureAdClientId and azureAdTenantId
