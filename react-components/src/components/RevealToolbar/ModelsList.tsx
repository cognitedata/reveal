/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';

import { Menu } from '@cognite/cogs.js';
import { type Model3D } from '@cognite/sdk';

export type ModelListProps = {
  models: Model3D[];
  selectedModel: Model3D | undefined;
  onModelChange: (model: Model3D | undefined) => void;
};

export const ModesList = ({
  models,
  selectedModel,
  onModelChange
}: ModelListProps): ReactElement => {
  if (models.length === 0) {
    return <></>;
  }
  return (
    <>
      {models.map((model) => {
        return (
          <Menu.Item
            key={`${model.id}`}
            toggled={selectedModel?.id === model.id}
            onClick={() => {
              onModelChange(model);
            }}>
            {model.name}
          </Menu.Item>
        );
      })}
    </>
  );
};
