import { useEffect, useState, useCallback } from 'react';
import { NullView } from 'components/NullView/NullView';
import { useTranslation } from 'hooks/useTranslation';
import { Workspace } from 'types';
import { workspaceService } from 'services';

import { Header, RecentWorkspacesContainer } from './elements';
import { RecentWorkspaceItem } from './RecentWorkspaceItem';

export interface RecentWorkspacesProps {
  onLoadWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspace: Workspace) => void;
}

export const RecentWorkspaces = ({
  onLoadWorkspace,
  onDeleteWorkspace,
}: RecentWorkspacesProps) => {
  const { t } = useTranslation('recent_workspaces');
  const [recentWorkspaces, setRecentWorkspaces] = useState<Workspace[]>([]);

  const loadWorkspaces = async () => {
    const workspaces = await workspaceService.loadWorkspaces();
    workspaces.sort((a, b) => b.dateModified - a.dateModified);
    setRecentWorkspaces(workspaces);
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const onWorkspaceDelete = useCallback((workspace: Workspace) => {
    onDeleteWorkspace(workspace);
    setTimeout(() => {
      loadWorkspaces();
    });
  }, []);

  return (
    <RecentWorkspacesContainer id="recentWorkspaces">
      <Header>{t('recent_workspaces_title', 'Recent workspaces')}</Header>
      {!recentWorkspaces.length && <NullView />}

      {recentWorkspaces.map((workspace) => (
        <RecentWorkspaceItem
          key={workspace.id}
          workspace={workspace}
          onLoadWorkspace={onLoadWorkspace}
          onDelete={onWorkspaceDelete}
        />
      ))}
    </RecentWorkspacesContainer>
  );
};
