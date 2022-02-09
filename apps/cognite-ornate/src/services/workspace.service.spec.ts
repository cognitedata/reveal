import { CogniteClient } from '@cognite/sdk';

import { WorkspaceService } from './workspace.service';

jest.mock('./storage-provider');

describe('ProjectExecutionService Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createService() {
    return new WorkspaceService({} as CogniteClient);
  }

  it('shall create an instance', async () => {
    const service = createService();
    expect(service).toBeTruthy();
  });

  it('shall create new workspace', async () => {
    const service = createService();
    expect(service.create()).toEqual(
      expect.objectContaining({
        name: 'Untitled Workspace',
      })
    );
  });

  it('shall add document', async () => {
    const service = createService();
    expect(
      service.addDocument([], {
        documentId: '123',
        documentName: 'test',
        x: 0,
        y: 0,
      })
    ).toEqual([
      {
        documentId: '123',
        documentName: 'test',
        x: 0,
        y: 0,
      },
    ]);
  });

  it('shall remove document', async () => {
    const service = createService();
    const docs = [
      {
        documentId: '123',
        documentName: 'test',
        x: 0,
        y: 0,
      },
    ];
    expect(service.removeDocument(docs, '123')).toEqual([]);
  });
});
