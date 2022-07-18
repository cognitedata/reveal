import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Icon, Input } from '@cognite/cogs.js';
import { useTranslation } from 'hooks/useTranslation';

import {
  WorkspaceHeaderTitlePanel,
  WorkspaceHeaderContainer,
} from './elements';

export interface WorkspaceHeaderProps {
  title: string;
  onTitleUpdated: (newTitle: string) => void;
}

export const WorkspaceHeader = ({
  title,
  onTitleUpdated,
}: WorkspaceHeaderProps) => {
  const { t } = useTranslation('WorkspaceHeader');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState('');

  useEffect(() => {
    setWorkspaceTitle(title);
  }, [title]);

  const onWorkspaceTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      setWorkspaceTitle(value);
    },
    []
  );

  const handleKeyboardKeys = (event: KeyboardEvent) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      setIsInputVisible(false);
      onTitleUpdated(workspaceTitle);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setIsInputVisible(false);
      setWorkspaceTitle(title);
    }
  };

  const showTitleInput = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      setIsInputVisible(!isInputVisible);
    },
    [isInputVisible]
  );

  return (
    <WorkspaceHeaderContainer>
      {!isInputVisible && (
        <WorkspaceHeaderTitlePanel>{workspaceTitle}</WorkspaceHeaderTitlePanel>
      )}
      {isInputVisible && (
        <WorkspaceHeaderTitlePanel>
          <Input
            size="small"
            value={workspaceTitle}
            onKeyDown={handleKeyboardKeys}
            onChange={onWorkspaceTitleChange}
          />
        </WorkspaceHeaderTitlePanel>
      )}{' '}
      <Icon
        title={t('edit_workspace_title', 'Click to edit the workspace title')}
        type="Edit"
        onClick={showTitleInput}
        size={10}
      />
    </WorkspaceHeaderContainer>
  );
};
