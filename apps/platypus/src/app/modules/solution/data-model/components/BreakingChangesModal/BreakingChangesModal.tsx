import { Modal } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';

import { StyledBody, StyledBreakingChanges } from './elements';

export interface BreakingChangesModalProps {
  breakingChanges: string;
  isUpdating: boolean;
  onCancel: () => void;
  onUpdate: () => void;
}

export const BreakingChangesModal = (props: BreakingChangesModalProps) => {
  const { t } = useTranslation('SolutionBreakingChangesModal');

  return (
    <Modal
      visible
      title={t('breaking_changes_data_model', 'Breaking changes in data model')}
      onCancel={props.onCancel}
      onOk={props.onUpdate}
      okText={t('publish_new_version', 'Publish new version')}
      okDisabled={props.isUpdating}
      icon={props.isUpdating ? 'Loader' : undefined}
    >
      <StyledBody>
        <div>
          {t(
            'breaking_changes_text',
            'There are breaking change(s) in your data model.'
          )}
        </div>
        <div>
          {t(
            'breaking_changes_new_version',
            'A new version of the data model will be created when publishing.'
          )}
        </div>
      </StyledBody>
      <StyledBreakingChanges>{props.breakingChanges}</StyledBreakingChanges>
    </Modal>
  );
};
