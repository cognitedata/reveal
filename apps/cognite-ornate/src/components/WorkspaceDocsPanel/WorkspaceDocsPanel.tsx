import { Collapse, Icon } from '@cognite/cogs.js';
import { ListItem } from 'components/List';
import { useTranslation } from 'hooks/useTranslation';
import { Workspace, WorkspaceDocument } from 'types';

import { WorkspaceHeader } from './WorkspaceHeader';

export interface WorkspaceDocsPanelProps {
  workspace: Workspace;
  workspaceDocs: WorkspaceDocument[];
  onLoadFile: (fileId: string, fileName: string) => void;
  onWorkspaceTitleUpdated: (newTitle: string) => void;
  onDeleteDocument: (doc: WorkspaceDocument) => void;
}

export const WorkspaceDocsPanel = ({
  workspace,
  workspaceDocs,
  onLoadFile,
  onWorkspaceTitleUpdated,
  onDeleteDocument,
}: WorkspaceDocsPanelProps) => {
  const { t } = useTranslation('workspace-docs-panel');

  return (
    <Collapse accordion={false} ghost defaultActiveKey="currentWorkspace">
      <Collapse.Panel
        header={
          <WorkspaceHeader
            onTitleUpdated={onWorkspaceTitleUpdated}
            title={workspace.name}
          />
        }
        key="currentWorkspace"
        isActive
      >
        {!workspaceDocs.length && (
          <div>
            {t(
              'search_hint',
              'Use the input field to search within your workspace, or within CDF.'
            )}
          </div>
        )}

        {workspaceDocs.map((doc) => (
          <ListItem
            key={doc.documentId}
            className="action-buttons"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLoadFile(doc.documentId.toString(), doc.documentName);
            }}
          >
            <Icon
              type="Map"
              style={{ marginRight: '5px', verticalAlign: 'middle' }}
            />
            {doc.documentName}
            <Icon
              className="action-button"
              type="Trash"
              size={12}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteDocument(doc);
              }}
            />
          </ListItem>
        ))}
      </Collapse.Panel>
    </Collapse>
  );
};
