/*!
 * Copyright 2025 Cognite AS
 */
import { SelectPanel } from '@cognite/cogs-lab';
import { Tooltip } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import { MAX_LABEL_LENGTH } from '../Architecture/TreeView/utilities/constants';
import { type ModelWithRevisionInfo } from '../../hooks/network/types';

export const ModelList = ({
  models,
  selectedRevisions,
  handleModelClick
}: {
  models: ModelWithRevisionInfo[] | undefined;
  selectedRevisions: Record<number, number | undefined>;
  handleModelClick: (modelData: ModelWithRevisionInfo) => void;
}): ReactElement => {
  return (
    <SelectPanel.Section title="Models">
      {models?.map((modelData) => {
        const isLargeLabel =
          modelData.displayName?.length !== undefined &&
          modelData.displayName.length > MAX_LABEL_LENGTH;
        const modelLabel = isLargeLabel
          ? `${modelData.displayName?.slice(0, MAX_LABEL_LENGTH)}...`
          : modelData.displayName;
        return (
          <Tooltip disabled={!isLargeLabel} key={modelData.id} content={modelData.displayName}>
            <SelectPanel.Item
              variant="toggle"
              key={`${modelData.id}`}
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
