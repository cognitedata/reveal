# @cognite/react-acl

Cognite access checking made easy

The purpose of this lib is to show the user a list of access they have/do not have

## Installation

```sh
yarn add @cognite/react-acl
```

## Usage

```
import { UserAccessList } from '@cognite/react-acl';

import { SIDECAR } from 'constants/app';

...

const requirements: AccessRequirements = [
    { context: 'relationships', aclName: 'relationshipsAcl', acl: ['READ'] },
    { context: 'geospatial', aclName: 'geospatialAcl', acl: ['READ'] },
    { context: 'assets', aclName: 'assetsAcl', acl: ['READ'] },
]

return (
    <UserAccessList baseUrl={SIDECAR.cdfApiBaseUrl} />
)
```

This will give you an output like:

```
× Relationships:
    Missing:
    - READ
✓ Geospatial
✓ Assets
```
