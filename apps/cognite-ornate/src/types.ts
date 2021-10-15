import { WorkspaceContent } from 'services/workspace.service';

export interface WorkspaceDocument {
  documentId: string;
  documentName: string;
}
export type Workspace = {
  id: string;
  name: string;
  dateCreated: number;
  dateModified: number;
  content: WorkspaceContent;
};
