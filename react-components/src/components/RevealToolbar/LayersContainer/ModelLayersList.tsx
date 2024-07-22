/*!
 * Copyright 2024 Cognite AS
 */
import { Divider } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
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
    <>
      {label !== undefined && (
        <>
          <Menu.ItemToggled>
            <WholeLayerVisibilityToggle
              modelHandlers={modelHandlers}
              label={label}
              update={update}
            />
          </Menu.ItemToggled>
          <Divider />
        </>
      )}
      <ModelContent modelHandlers={modelHandlers} update={update} />
    </>
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
    <Menu.ItemToggled
      key={modelHandler.key()}
      hideTooltip={true}
      toggled={modelHandler.visible()}
      label={modelHandler.name}
      onClick={(e: ChangeEvent) => {
        console.log('Toggled');
        e.stopPropagation();
        modelHandler.setVisibility(!modelHandler.visible());
        update(viewer.models, viewer.get360ImageCollections());
      }}
      checkboxProps={{
        checked: modelHandler.visible(),
        onChange: (e: ChangeEvent) => {
          e.stopPropagation();
          modelHandler.setVisibility(!modelHandler.visible());
          update(viewer.models, viewer.get360ImageCollections());
        }
      }}></Menu.ItemToggled>
  );
};
