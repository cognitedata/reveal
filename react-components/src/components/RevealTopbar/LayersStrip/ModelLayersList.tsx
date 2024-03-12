/*!
 * Copyright 2024 Cognite AS
 */
import { Divider, Menu } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { type ReactElement, type ChangeEvent } from 'react';
import { WholeLayerVisibilityToggle } from './WholeLayerVisibilityToggle';

export const ModelLayersList = ({
  modelHandlers,
  update,
  label
}: {
  modelHandlers: ModelHandler[];
  update: () => void;
  label?: string;
}): ReactElement => {
  return (
    <Menu>
      {label !== undefined && (
        <>
          <Menu.Item>
            <WholeLayerVisibilityToggle
              modelHandlers={modelHandlers}
              label={label}
              update={update}
            />
          </Menu.Item>
          <Divider />
        </>
      )}
      <ModelContent modelHandlers={modelHandlers} update={update} />
    </Menu>
  );
};

const ModelContent = ({
  modelHandlers,
  update
}: {
  modelHandlers: ModelHandler[];
  update: () => void;
}): ReactElement => {
  return (
    <div>
      {modelHandlers.map((handler, index) => (
        <ModelItem key={index} modelHandler={handler} update={update} />
      ))}
    </div>
  );
};

const ModelItem = ({
  modelHandler,
  update
}: {
  modelHandler: ModelHandler;
  update: () => void;
}): ReactElement => {
  return (
    <Menu.Item
      key={modelHandler.key()}
      hideTooltip={true}
      hasCheckbox
      checkboxProps={{
        checked: modelHandler.visible(),
        onChange: (e: ChangeEvent) => {
          e.stopPropagation();
          modelHandler.setVisibility(!modelHandler.visible());
          update();
        }
      }}>
      {modelHandler.key()}
    </Menu.Item>
  );
};
