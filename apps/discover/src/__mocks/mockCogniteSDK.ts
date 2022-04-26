import { setClient } from 'utils/getCogniteSDKClient';

import { mockCogniteClient } from '__mocks/MockedCogniteClient';

setClient(mockCogniteClient);

export {};
