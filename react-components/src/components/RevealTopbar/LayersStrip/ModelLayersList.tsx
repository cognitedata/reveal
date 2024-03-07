import { Divider, Menu } from '@cognite/cogs.js';
import { ModelHandler } from './ModelHandler';
import { ChangeEvent } from 'react';
import { WholeLayerVisibilityToggle } from './WholeLayerVisibilityToggle';

export const ModelLayersList = ({
  modelHandlers,
  update,
  label
}: {
  modelHandlers: ModelHandler[];
  update: () => void;
  label?: string;
}) => {
  return (
    <Menu>
      {label && (
        <>
          <WholeLayerVisibilityToggle modelHandlers={modelHandlers} label={label} update={update} />
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
}) => {
  return (
    <div>
      {modelHandlers.map((handler) => (
        <ModelItem modelHandler={handler} update={update} />
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
}) => {
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
