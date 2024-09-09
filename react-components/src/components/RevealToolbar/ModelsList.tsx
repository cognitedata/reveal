/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs.js';
import { type ModelWithRevision } from '../../hooks/types';

type ModelListProps = {
  modelsWithRevision: ModelWithRevision[];
  selectedModel: ModelWithRevision | undefined;
  onModelChange: (model: ModelWithRevision | undefined) => void;
};

export const ModelsList = ({
  modelsWithRevision,
  selectedModel,
  onModelChange
}: ModelListProps): ReactElement => {
  if (modelsWithRevision.length === 0) {
    return <></>;
  }
  return (
    <>
      {modelsWithRevision.map((modelData) => {
        return (
          <Menu.Item
            key={`${modelData.model.id}`}
            toggled={selectedModel?.model.id === modelData.model.id}
            onClick={() => {
              onModelChange(modelData);
            }}>
            {modelData.model?.name}
          </Menu.Item>
        );
      })}
    </>
  );
};
