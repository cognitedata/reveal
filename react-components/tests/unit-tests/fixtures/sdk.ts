import { Mock } from 'moq.ts';
import { CogniteClient } from '@cognite/sdk';

export const sdkMock = new Mock<CogniteClient>()
  .setup((p) => p.getBaseUrl())
  .returns('https://api.cognitedata.com')
  .setup((p) => p.project)
  .returns('test-project')
  .object();
