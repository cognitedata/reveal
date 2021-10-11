import { MockedCogniteClient } from './MockedCogniteClient';

export class MockedSDKWells extends MockedCogniteClient {
  wells = {};

  wellbores = {
    getFromWells: () => Promise.resolve(),
  };
}
