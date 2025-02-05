/*!
 * Copyright 2025 Cognite AS
 */
import { SelectPanel } from '@cognite/cogs-lab';
import { EmptyState, FindIllustration, Tooltip } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import { MAX_LABEL_LENGTH } from '../Architecture/TreeView/utilities/constants';
import { type ModelWithRevisionInfo } from '../../hooks/network/types';
import { useTranslation } from '../i18n/I18n';
import { type TranslationInput } from '../../architecture';

type ModelListProps = {
  modelType: string | undefined;
  models: ModelWithRevisionInfo[] | undefined;
  selectedRevisions: Record<number, number | undefined>;
  handleModelClick: (modelData: ModelWithRevisionInfo) => void;
};

export const ModelList = ({
  modelType,
  models,
  selectedRevisions,
  handleModelClick
}: ModelListProps): ReactElement => {
  const { t } = useTranslation();

  const title = getTitle(modelType, t);

  if (models === undefined || models.length === 0) {
    return (
      <SelectPanel.Section title={t({ key: 'NO_MODELS_FOUND' })}>
        <EmptyState title={t({ key: 'NO_MODELS_FOUND' })} illustration={<FindIllustration />} />
      </SelectPanel.Section>
    );
  }

  return (
    <SelectPanel.Section title={title}>
      {models.map((modelData) => {
        const isLargeLabel = modelData.displayName.length > MAX_LABEL_LENGTH;
        const modelLabel = isLargeLabel
          ? `${modelData.displayName.slice(0, MAX_LABEL_LENGTH)}...`
          : modelData.displayName;

        return (
          <Tooltip key={modelData.id} disabled={!isLargeLabel} content={modelData.displayName}>
            <SelectPanel.Item
              variant="toggle"
              label={modelLabel}
              checked={selectedRevisions[modelData.id] !== undefined}
              onClick={() => {
                handleModelClick(modelData);
              }}
            />
          </Tooltip>
        );
      })}
    </SelectPanel.Section>
  );
};

const getTitle = (
  modelType: string | undefined,
  t: (translationInput: TranslationInput) => string
): string => {
  switch (modelType) {
    case 'CAD':
      return t({ key: 'CAD_MODELS' });
    case 'Point cloud':
      return t({ key: 'POINT_CLOUDS' });
    case '360 image':
      return t({ key: 'IMAGES_360' });
    default:
      return t({ key: 'ALL_3D_RESOURCES' });
  }
};
