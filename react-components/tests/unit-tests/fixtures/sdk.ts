import { Mock } from 'moq.ts';
import { type CogniteClient } from '@cognite/sdk';

export const sdkMock = new Mock<CogniteClient>()
  .setup((p) => p.getBaseUrl())
  .returns('https://api.cognitedata.com')
  .setup((p) => p.project)
  .returns('test-project')
  .object();
