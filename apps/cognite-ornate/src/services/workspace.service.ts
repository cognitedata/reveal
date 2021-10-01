import { OrnateJSON } from 'library/types';
import { Workspace, WorkspaceDocument } from 'types';
import { v4 as uuid } from 'uuid';

import { StorageProvider } from './storage-provider';

export class WorkspaceService {
  private storage: StorageProvider;
  private workspacesStorageKey = 'ornate_workspaces';
  private workspaceStoragePrefix = 'ornate_workspace_';

  constructor() {
    this.storage = new StorageProvider();
  }
  create(): Workspace {
    return {
      id: uuid(),
      name: 'Untitled Workspace',
      dateCreated: Date.now(),
      dateModified: Date.now(),
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
    let savedWorkspaces = (await this.storage.getItem(
      this.workspacesStorageKey,
      []
    )) as Workspace[];

    if (!savedWorkspaces) {
      savedWorkspaces = [];
    }

    const updatedWorkspacesList = [
      ...savedWorkspaces?.filter((ws) => ws.id !== workspace.id),
      { ...workspace, dateModified: Date.now() },
    ];
    await this.storage.setItem(
      this.workspacesStorageKey,
      updatedWorkspacesList
    );

    return true;
  }

  loadWorkspaces(): Promise<Workspace[]> {
    return this.storage.getItem(this.workspacesStorageKey, []) as Promise<
      Workspace[]
    >;
  }

  async deleteWorkspace(workspace: Workspace): Promise<boolean> {
    let savedWorkspaces = (await this.storage.getItem(
      this.workspacesStorageKey,
      []
    )) as Workspace[];

    savedWorkspaces = savedWorkspaces.filter((ws) => ws.id !== workspace.id);
    await this.storage.setItem(this.workspacesStorageKey, savedWorkspaces);
    await this.storage.removeItem(
      `${this.workspaceStoragePrefix}${workspace.id}`
    );
    return true;
  }

  async loadWorkspaceContents(workspace: Workspace): Promise<OrnateJSON> {
    return this.storage.getItem(
      `${this.workspaceStoragePrefix}${workspace.id}`,
      { documents: [] }
    ) as Promise<OrnateJSON>;
  }

  saveWorkspaceContents(workspaceId: string, contents: OrnateJSON): void {
    const parsedJson = {
      documents: contents.documents.map((doc) => {
        return {
          ...doc,
          drawings: doc.drawings.filter(
            (drawing) => drawing.attrs.userGenerated
          ),
        };
      }),
    };
    this.storage.setItem(
      `${this.workspaceStoragePrefix}${workspaceId}`,
      parsedJson
    );
  }
}
