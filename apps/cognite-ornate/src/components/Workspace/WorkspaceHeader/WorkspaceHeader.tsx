import { Icon } from '@cognite/cogs.js';
import { useTranslation } from 'hooks/useTranslation';

export interface WorkspaceHeaderProps {
  isBackVisible: boolean;
  onBackClick: () => void;
  setIsOpen: (isOpen: boolean) => void;
}
export const WorkspaceHeader = ({
  setIsOpen,
  isBackVisible,
  onBackClick,
}: WorkspaceHeaderProps) => {
  const { t } = useTranslation('workspace-sidebar');

  return (
    <>
      {isBackVisible && (
        <Icon
          type="ChevronLeftCompact"
          style={{ cursor: 'pointer' }}
          onClick={onBackClick}
          title={t('back', 'Back')}
        />
      )}
      <Icon
        type="WorkSpace"
        style={{ marginLeft: '5px', marginRight: '10px' }}
      />{' '}
      <span>{t('my_workspaces_title', 'My Workspaces')}</span>
      <Icon
        title={t('close_sidebar', 'Close sidebar')}
        type="PanelLeft"
        style={{ marginLeft: 'auto', cursor: 'pointer' }}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
};
