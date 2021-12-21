import { WorkspaceContent } from 'services/workspace.service';

export interface WorkspaceDocument {
  documentId: string;
  documentExId?: string;
  documentName: string;
  x: number;
  y: number;
}
export type Workspace = {
  id: string;
  name: string;
  dateCreated: number;
  dateModified: number;
  content: WorkspaceContent;
};
