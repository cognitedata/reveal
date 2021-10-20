import { CogniteClient } from '@cognite/sdk';
import { Marker, OrnateJSON } from '@cognite/ornate';
import { Workspace, WorkspaceDocument } from 'types';
import { v4 as uuid } from 'uuid';

import { StorageProvider } from './storage-provider';

export type WorkspaceContent = OrnateJSON & {
  markers: Marker[];
};

export class WorkspaceService {
  private storage: StorageProvider;

  constructor(client: CogniteClient) {
    this.storage = new StorageProvider(client);
  }

  create(): Workspace {
    return {
      id: uuid(),
      name: 'Untitled Workspace',
      dateCreated: Date.now(),
      dateModified: Date.now(),
      content: {
        documents: [],
        connectedLines: [],
        markers: [],
      },
    };
  }

  addDocument(
    documents: WorkspaceDocument[],
    documentId: string,
    documentName: string
  ): WorkspaceDocument[] {
    return [...documents, { documentId, documentName }];
  }

  removeDocument(
    documents: WorkspaceDocument[],
    documentId: string
  ): WorkspaceDocument[] {
    return documents.filter((doc) => doc.documentId !== documentId);
  }

  async saveWorkspace(workspace: Workspace): Promise<boolean> {
    await this.storage.saveWorkspace(workspace.id, workspace);
    return true;
  }

  async loadWorkspaces(): Promise<Workspace[]> {
    return this.storage.getWorkspaces() as Promise<Workspace[]>;
  }

  async loadWorkspace(workspaceId: string): Promise<Workspace> {
    return this.storage.getWorkspace(workspaceId) as Promise<Workspace>;
  }

  async deleteWorkspace(workspace: Workspace): Promise<boolean> {
    await this.storage.deleteWorkspace(workspace.id);
    return true;
  }
}

export default WorkspaceService;
