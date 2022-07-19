# @cognite/fdm-sdk-alpha

A temp sdk for FDM things.

Named alpha on purpose to ensure this does not survive.

It should eventually land in the real sdk instead.

## Installation

```sh
yarn add @cognite/fdm-sdk-alpha
```

```
import { getCogniteClientFDM } from '@cognite/fdm-sdk-alpha';

const clientCognite = getCogniteSDKClient(); // get from your own singleton etc
const clientCogniteFDM = getCogniteClientFDM();

const response = await clientCogniteFDM.get.spaces({
    client: clientCognite,
    items: [{ externalId: SPACE_ID }],
});

```

Happy hacking!
