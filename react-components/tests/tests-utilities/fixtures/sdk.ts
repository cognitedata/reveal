import { Mock } from 'moq.ts';
import { type CogniteClient } from '@cognite/sdk';

export const sdkMock = new Mock<CogniteClient>()
  .setup((p) => p.getBaseUrl())
  .returns('https://api.cognitedata.com')
  .setup((p) => p.project)
  .returns('test-project')
  .setup((p) => p.models3D.retrieve)
  .returns(async () => ({ name: 'Model Name', id: 1, createdTime: new Date() }))
  .object();
