import { Tooltip, Popconfirm, Icon } from '@cognite/cogs.js';
import { useTranslation } from 'hooks/useTranslation';
import { Workspace } from 'types';
import { toDisplayDateTime } from 'utils/date';

import { ItemWrapper, RecentListItem } from './elements';

export interface RecentWorkspaceItemProps {
  workspace: Workspace;
  onLoadWorkspace: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
}

export const RecentWorkspaceItem = ({
  workspace,
  onLoadWorkspace,
  onDelete,
}: RecentWorkspaceItemProps) => {
  const { t } = useTranslation('recent_workspaces');

  return (
    <RecentListItem key={workspace.id} active={false}>
      <ItemWrapper onClick={() => onLoadWorkspace(workspace)}>
        <strong style={{ display: 'block', marginTop: '4px' }}>
          {workspace.name}
        </strong>
        <p className="description">
          {t('recent-workspace-date-modified', 'Last modified')}:{' '}
          {toDisplayDateTime(workspace.dateModified)}
        </p>
      </ItemWrapper>

      <div className="recent-workspace-actions">
        <Tooltip content={t('tooltip_delete', 'Delete')}>
          <Popconfirm
            placement="bottom-end"
            content={
              <span>
                <strong>
                  {t('pop_confirm_strong', 'This is irreversible.')}
                </strong>
                <br />{' '}
                {t(
                  'pop_confirm_reg',
                  'You will lose all changes made in this file.'
                )}
                <br /> {t('pop_confirm_question', 'Are you sure?')}
              </span>
            }
            onConfirm={() => onDelete(workspace)}
            okText={t('okText', 'Delete')}
            cancelText={t('cancelText', 'Cancel')}
          >
            <Icon
              type="Delete"
              role="button"
              tabIndex={0}
              aria-label={t('delete_tooltip_icon', 'Delete stash')}
              data-testid="delete-icon"
            />
          </Popconfirm>
        </Tooltip>
      </div>
    </RecentListItem>
  );
};
