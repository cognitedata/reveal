import { CogniteClient } from '@cognite/sdk';
import { Workspace } from 'types';
import sidecar from 'utils/sidecar';

export class StorageProvider {
  private client: CogniteClient;
  private baseUrl: string;
  private project: string;
  constructor(client: CogniteClient) {
    this.client = client;
    this.baseUrl = sidecar.mpServiceBaseURL;
    this.project = client.project;
  }
  async getWorkspaces(): Promise<unknown> {
    return this.client
      .get<{ data: (Workspace & { key: string })[] }>(
        `${this.baseUrl}/${this.project}/v1/workspaces`,
        {
          withCredentials: true,
        }
      )
      .then((result) =>
        result.data.data.map((space) => ({
          ...space,
          id: space.key,
        }))
      );
  }

  async getWorkspace(workspaceId: string): Promise<unknown> {
    return this.client
      .get<{ data: Workspace & { key: string } }>(
        `${this.baseUrl}/${this.project}/v1/workspaces/${workspaceId}`,
        {
          withCredentials: true,
        }
      )
      .then((result) => {
        const workspace = result.data.data;
        return {
          ...workspace,
          id: workspace.key,
        };
      });
  }

  async saveWorkspace(
    workspaceId: string,
    workspace: Workspace
  ): Promise<unknown> {
    return this.client.post(
      `${this.baseUrl}/${this.project}/v1/workspaces/${workspaceId}`,
      {
        data: {
          workspace,
        },
        withCredentials: true,
      }
    );
  }

  async deleteWorkspace(workspaceId: string): Promise<unknown> {
    return this.client.post(
      `${this.baseUrl}/${this.project}/v1/workspaces/delete/${workspaceId}`,
      {
        withCredentials: true,
      }
    );
  }
}
