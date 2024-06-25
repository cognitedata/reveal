/*!
 * Copyright 2024 Cognite AS
 */
import { Divider, Menu } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { type ReactElement, type ChangeEvent } from 'react';
import { WholeLayerVisibilityToggle } from './WholeLayerVisibilityToggle';
import { withSuppressRevealEvents } from '../../../higher-order-components/withSuppressRevealEvents';
import { type UpdateModelHandlersCallback } from './useModelHandlers';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { type Cognite3DViewer } from '@cognite/reveal';

const SuppressedMenu = withSuppressRevealEvents(Menu);

export const ModelLayersList = ({
  modelHandlers,
  update,
  label
}: {
  modelHandlers: ModelHandler[];
  update: UpdateModelHandlersCallback;
  label?: string;
}): ReactElement => {
  if (modelHandlers.length === 0) {
    return <></>;
  }
  return (
    <SuppressedMenu>
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
    </SuppressedMenu>
  );
};

const ModelContent = ({
  modelHandlers,
  update
}: {
  modelHandlers: ModelHandler[];
  update: UpdateModelHandlersCallback;
}): ReactElement => {
  const viewer = useReveal();

  return (
    <>
      {modelHandlers.map((handler, index) => (
        <ModelItem key={index} modelHandler={handler} update={update} viewer={viewer} />
      ))}
    </>
  );
};

const ModelItem = ({
  modelHandler,
  viewer,
  update
}: {
  modelHandler: ModelHandler;
  update: UpdateModelHandlersCallback;
  viewer: Cognite3DViewer;
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
          update(viewer.models, viewer.get360ImageCollections());
        }
      }}>
      {modelHandler.name}
    </Menu.Item>
  );
};
