import { Collapse, Icon } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Asset } from '@cognite/sdk';
import { ListItem } from 'components/List';
import { useTranslation } from 'hooks/useTranslation';
import { useEffect, useState } from 'react';
import { Workspace, WorkspaceDocument } from 'types';

import { WorkspaceHeader } from './WorkspaceHeader';
import { AssetIcon } from './elements';

export interface WorkspaceDocsPanelProps {
  workspace: Workspace;
  workspaceDocs: WorkspaceDocument[];
  onLoadFile: (fileId: string, fileName: string) => void;
  onWorkspaceTitleUpdated: (newTitle: string) => void;
  onDeleteDocument: (doc: WorkspaceDocument) => void;
  onAssetClick: (fileId: string, asset: Asset) => void;
}

export const WorkspaceDocsPanel = ({
  workspace,
  workspaceDocs,
  onLoadFile,
  onWorkspaceTitleUpdated,
  onDeleteDocument,
  onAssetClick,
}: WorkspaceDocsPanelProps) => {
  const { client } = useAuthContext();
  const { t } = useTranslation('workspace-docs-panel');
  const [assetsByFile, setAssetsByFile] = useState<Record<string, Asset[]>>();
  useEffect(() => {
    workspaceDocs.forEach(async (doc) => {
      if (assetsByFile?.[doc.documentId]) {
        return;
      }
      const file = await client?.files
        .retrieve([{ id: Number(doc.documentId) }])
        .then((res) => res[0]);

      const assetIds = file?.assetIds?.map((x) => ({ id: x }));
      if (!file || !assetIds || assetIds.length === 0) {
        return;
      }
      const assets = await client?.assets.retrieve(assetIds);
      if (!assets) {
        return;
      }
      setAssetsByFile((prev) => ({
        ...prev,
        [doc.documentId]: assets,
      }));
    });
  }, [workspaceDocs]);
  return (
    <div>
      <WorkspaceHeader
        onTitleUpdated={onWorkspaceTitleUpdated}
        title={workspace.name}
      />

      {!workspaceDocs.length && (
        <div>
          {t(
            'search_hint',
            'Use the input field to search within your workspace, or within CDF.'
          )}
        </div>
      )}

      <Collapse accordion={false} ghost defaultActiveKey="currentWorkspace">
        {workspaceDocs.map((doc) => (
          <Collapse.Panel
            key={doc.documentId}
            header={
              <ListItem
                key={doc.documentId}
                className="indent action-buttons"
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
            }
            isActive
          >
            {assetsByFile?.[doc.documentId]?.map((asset) => (
              <ListItem
                className="indent"
                key={asset.id}
                onClick={() => onAssetClick(doc.documentId, asset)}
              >
                <AssetIcon />
                {asset.name}
              </ListItem>
            ))}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
};
