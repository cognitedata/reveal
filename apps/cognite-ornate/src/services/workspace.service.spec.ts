import { WorkspaceService } from './workspace.service';

jest.mock('./storage-provider');

describe('ProjectExecutionService Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createService() {
    return new WorkspaceService();
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
    expect(service.addDocument([], '123', 'test')).toEqual([
      {
        documentId: '123',
        documentName: 'test',
      },
    ]);
  });

  it('shall remove document', async () => {
    const service = createService();
    const docs = [
      {
        documentId: '123',
        documentName: 'test',
      },
    ];
    expect(service.removeDocument(docs, '123')).toEqual([]);
  });
});
