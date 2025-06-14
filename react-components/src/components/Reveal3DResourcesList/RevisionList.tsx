import { SelectPanel } from '@cognite/cogs-lab';
import { LoaderIcon } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import { type ModelWithRevisionInfo } from '../../hooks/network/types';
import { useTranslation } from '../i18n/I18n';

export const RevisionList = ({
  revisions,
  isRevisionsLoading,
  selectedModel,
  selectedRevisions,
  handleRevisionSelect
}: {
  revisions: Array<{ id: number; createdTime: Date }>;
  isRevisionsLoading: boolean;
  selectedModel: ModelWithRevisionInfo;
  selectedRevisions: Record<number, number | undefined>;
  handleRevisionSelect: (revisionId: number) => void;
}): ReactElement => {
  const { t } = useTranslation();
  return (
    <SelectPanel.Section title={t({ key: 'REVISIONS' })}>
      {isRevisionsLoading ? (
        <LoaderIcon />
      ) : (
        revisions
          .sort((a, b) => a.createdTime.getTime() - b.createdTime.getTime())
          .map((revision, index) => (
            <SelectPanel.Item
              key={revision.id}
              label={`Revision ${index + 1}`}
              variant="toggle"
              checked={selectedRevisions[selectedModel.id] === revision.id}
              onClick={() => {
                handleRevisionSelect(revision.id);
              }}
            />
          ))
      )}
    </SelectPanel.Section>
  );
};
